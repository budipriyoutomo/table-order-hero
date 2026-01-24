import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  checkRateLimit, 
  getClientIP, 
  checkLoginAttempt, 
  recordFailedLogin, 
  clearFailedLogins 
} from "../_shared/rate-limiter.ts";
import { createSession } from "../_shared/session-store.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit config: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);
  
  // Check rate limit
  const rateLimit = checkRateLimit(`login:${clientIP}`, RATE_LIMIT_CONFIG);
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil(rateLimit.resetIn / 1000) 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000))
        } 
      }
    );
  }

  // Check for lockout from failed attempts
  const loginCheck = checkLoginAttempt(`login:${clientIP}`);
  if (!loginCheck.allowed) {
    console.warn(`Login lockout for IP: ${clientIP}, attempts: ${loginCheck.failedAttempts}`);
    return new Response(
      JSON.stringify({ 
        error: 'Account temporarily locked due to too many failed attempts', 
        retryAfter: Math.ceil(loginCheck.lockoutRemaining / 1000) 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(loginCheck.lockoutRemaining / 1000))
        } 
      }
    );
  }

  try {
    const { pin } = await req.json();

    // Validate PIN format
    if (!pin || typeof pin !== 'string' || pin.length < 4 || pin.length > 8) {
      console.error('Invalid PIN format received');
      return new Response(
        JSON.stringify({ error: 'Invalid PIN format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate PIN contains only digits
    if (!/^\d+$/.test(pin)) {
      console.error('PIN contains non-numeric characters');
      return new Response(
        JSON.stringify({ error: 'PIN must contain only numbers' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Attempting login with PIN...');

    const response = await fetch('https://restodemo.sopwer.id/api/method/resto.api.login_with_pin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();
    console.log('Login response status:', response.status);

    if (!response.ok) {
      console.error('Login failed:', data);
      recordFailedLogin(`login:${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if login was successful based on response structure
    if (data.message?.status === 'success' || data.message?.message === 'Authentication success') {
      console.log('Login successful for user:', data.message?.full_name || data.full_name);
      
      // Clear failed login attempts on success
      clearFailedLogins(`login:${clientIP}`);
      
      // Store credentials server-side and create session
      const sid = data.message?.sid || `session-${Date.now()}`;
      createSession({
        sid,
        fullName: data.message?.full_name || data.full_name,
        username: data.message?.username,
        email: data.message?.email,
        apiKey: data.message?.api_key,
        apiSecret: data.message?.api_secret,
      });
      
      // Return ONLY safe user data - NO credentials sent to client
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            full_name: data.message?.full_name || data.full_name,
            username: data.message?.username,
            email: data.message?.email,
            sid: sid, // Session ID for future requests
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.error('Login failed - invalid credentials');
      recordFailedLogin(`login:${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Invalid PIN', success: false }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error: unknown) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
