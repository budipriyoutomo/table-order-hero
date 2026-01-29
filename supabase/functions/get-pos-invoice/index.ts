import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIP } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit config: 60 requests per minute per session
const RATE_LIMIT_CONFIG = {
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sid, invoiceId } = await req.json();

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

    // Validate invoice ID
    if (!invoiceId || typeof invoiceId !== 'string') {
      console.error('Missing or invalid invoice ID');
      return new Response(
        JSON.stringify({ error: 'Invoice ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const clientIP = getClientIP(req);
    
    // Check rate limit using session ID for more accurate limiting
    const rateLimit = checkRateLimit(`pos-invoice:${sid}:${clientIP}`, RATE_LIMIT_CONFIG);
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

    // Get credentials from database using service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Look up session and check expiry
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('api_key, api_secret, expires_at')
      .eq('sid', sid)
      .single();
    
    if (sessionError || !session) {
      console.error('Session not found:', sid);
      return new Response(
        JSON.stringify({ error: 'Session expired, please login again', code: 'SESSION_EXPIRED' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      console.error('Session expired:', sid);
      // Clean up expired session
      await supabase.from('user_sessions').delete().eq('sid', sid);
      return new Response(
        JSON.stringify({ error: 'Session expired, please login again', code: 'SESSION_EXPIRED' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build URL for POS Invoice API - URL encode the invoice ID
    const encodedInvoiceId = encodeURIComponent(invoiceId);
    const apiUrl = `https://restodemo.sopwer.id/api/resource/POS%20Invoice/${encodedInvoiceId}?fields=["*"]&limit_page_length=0`;
    
    console.log(`Fetching POS Invoice: ${invoiceId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `token ${session.api_key}:${session.api_secret}`,
      },
    });

    const data = await response.json();
    console.log('POS Invoice response status:', response.status);

    if (!response.ok) {
      console.error('Fetch POS Invoice failed:', data);
      
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
      
      // Handle not found
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Invoice not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invoice' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (data.data) {
      console.log(`Successfully fetched invoice: ${invoiceId}`);
      return new Response(
        JSON.stringify({
          success: true,
          invoice: data.data,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.error('Invalid invoice response format');
      return new Response(
        JSON.stringify({ error: 'Invalid response from server' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error: unknown) {
    console.error('Fetch POS Invoice error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
