// Simple in-memory rate limiter for Edge Functions
// Note: This resets on function cold starts, but provides basic protection

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function getClientIP(req: Request): string {
  // Try various headers for client IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a hash of user-agent + some headers for basic identification
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `ua-${hashString(userAgent)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Track failed login attempts separately for stricter limiting
const failedLoginStore = new Map<string, { count: number; lockoutUntil: number }>();

export function checkLoginAttempt(identifier: string): { 
  allowed: boolean; 
  lockoutRemaining: number;
  failedAttempts: number;
} {
  const now = Date.now();
  const entry = failedLoginStore.get(identifier);

  if (!entry) {
    return { allowed: true, lockoutRemaining: 0, failedAttempts: 0 };
  }

  if (now < entry.lockoutUntil) {
    return { 
      allowed: false, 
      lockoutRemaining: entry.lockoutUntil - now,
      failedAttempts: entry.count 
    };
  }

  // Lockout expired, but keep tracking failed attempts for progressive delays
  return { allowed: true, lockoutRemaining: 0, failedAttempts: entry.count };
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now();
  const entry = failedLoginStore.get(identifier) || { count: 0, lockoutUntil: 0 };
  
  entry.count++;
  
  // Progressive lockout: 
  // 3 failures = 30 second lockout
  // 5 failures = 2 minute lockout
  // 10+ failures = 15 minute lockout
  if (entry.count >= 10) {
    entry.lockoutUntil = now + (15 * 60 * 1000); // 15 minutes
  } else if (entry.count >= 5) {
    entry.lockoutUntil = now + (2 * 60 * 1000); // 2 minutes
  } else if (entry.count >= 3) {
    entry.lockoutUntil = now + (30 * 1000); // 30 seconds
  }
  
  failedLoginStore.set(identifier, entry);
}

export function clearFailedLogins(identifier: string): void {
  failedLoginStore.delete(identifier);
}
