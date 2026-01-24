import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pin } = await req.json();

    if (!pin || typeof pin !== 'string' || pin.length < 4) {
      console.error('Invalid PIN format received');
      return new Response(
        JSON.stringify({ error: 'Invalid PIN format' }),
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
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: data }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if login was successful based on response structure
    if (data.message?.status === 'success' || data.message?.message === 'Authentication success') {
      console.log('Login successful for user:', data.message?.full_name || data.full_name);
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            full_name: data.message?.full_name || data.full_name,
            username: data.message?.username,
            email: data.message?.email,
            api_key: data.message?.api_key,
            api_secret: data.message?.api_secret,
            sid: data.message?.sid,
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.error('Login failed - invalid credentials');
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
