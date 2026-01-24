// Server-side session store for API credentials
// Credentials are stored in memory on the server, never sent to client

interface SessionData {
  userId: string;
  fullName: string;
  username?: string;
  email?: string;
  apiKey: string;
  apiSecret: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory session store (resets on cold start)
// For production, consider using Supabase database or Redis
const sessionStore = new Map<string, SessionData>();

// Session duration: 8 hours
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export function createSession(data: {
  sid: string;
  fullName: string;
  username?: string;
  email?: string;
  apiKey: string;
  apiSecret: string;
}): string {
  const now = Date.now();
  
  // Clean up expired sessions periodically
  if (sessionStore.size > 1000) {
    for (const [key, session] of sessionStore.entries()) {
      if (now > session.expiresAt) {
        sessionStore.delete(key);
      }
    }
  }

  const sessionData: SessionData = {
    userId: data.sid,
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    apiKey: data.apiKey,
    apiSecret: data.apiSecret,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  };

  sessionStore.set(data.sid, sessionData);
  
  return data.sid;
}

export function getSession(sid: string): SessionData | null {
  const session = sessionStore.get(sid);
  
  if (!session) {
    return null;
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    sessionStore.delete(sid);
    return null;
  }

  return session;
}

export function getSessionCredentials(sid: string): { apiKey: string; apiSecret: string } | null {
  const session = getSession(sid);
  
  if (!session) {
    return null;
  }

  return {
    apiKey: session.apiKey,
    apiSecret: session.apiSecret,
  };
}

export function deleteSession(sid: string): void {
  sessionStore.delete(sid);
}

export function refreshSession(sid: string): boolean {
  const session = sessionStore.get(sid);
  
  if (!session) {
    return false;
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    sessionStore.delete(sid);
    return false;
  }

  // Extend session
  session.expiresAt = now + SESSION_DURATION_MS;
  sessionStore.set(sid, session);
  
  return true;
}
