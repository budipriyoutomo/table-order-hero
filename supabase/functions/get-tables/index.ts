import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, getClientIP } from "../_shared/rate-limiter.ts";
import { getSessionCredentials, refreshSession } from "../_shared/session-store.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit config: 30 requests per minute per session
const RATE_LIMIT_CONFIG = {
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sid } = await req.json();

    // Validate session ID
    if (!sid || typeof sid !== 'string') {
      console.error('Missing or invalid session ID');
      return new Response(
        JSON.stringify({ error: 'Authentication required', code: 'NO_SESSION' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const clientIP = getClientIP(req);
    
    // Check rate limit using session ID for more accurate limiting
    const rateLimit = checkRateLimit(`tables:${sid}:${clientIP}`, RATE_LIMIT_CONFIG);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for session: ${sid}`);
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

    // Get credentials from server-side session store
    const credentials = getSessionCredentials(sid);
    
    if (!credentials) {
      console.error('Session not found or expired:', sid);
      return new Response(
        JSON.stringify({ error: 'Session expired, please login again', code: 'SESSION_EXPIRED' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Refresh session to extend expiry
    refreshSession(sid);

    console.log('Fetching tables with server-side credentials...');

    const response = await fetch('https://restodemo.sopwer.id/api/method/resto.api.get_all_tables_with_details', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `token ${credentials.apiKey}:${credentials.apiSecret}`,
      },
    });

    const data = await response.json();
    console.log('Tables response status:', response.status);

    if (!response.ok) {
      console.error('Fetch tables failed:', data);
      
      // If external API returns auth error, session might be invalid
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Session invalid, please login again', code: 'SESSION_EXPIRED' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tables' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (data.message && Array.isArray(data.message)) {
      console.log(`Successfully fetched ${data.message.length} tables`);
      return new Response(
        JSON.stringify({
          success: true,
          tables: data.message,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.error('Invalid tables response format');
      return new Response(
        JSON.stringify({ error: 'Invalid response from server' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error: unknown) {
    console.error('Fetch tables error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
