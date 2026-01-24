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
    const { api_key, api_secret } = await req.json();

    if (!api_key || !api_secret) {
      console.error('Missing API credentials');
      return new Response(
        JSON.stringify({ error: 'Missing API credentials' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const authToken = `token ${api_key}:${api_secret}`;
    console.log('Fetching tables with auth token...');

    const response = await fetch('https://restodemo.sopwer.id/api/method/resto.api.get_all_tables_with_details', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
    });

    const data = await response.json();
    console.log('Tables response status:', response.status);

    if (!response.ok) {
      console.error('Failed to fetch tables:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tables', details: data }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully fetched', data.message?.length || 0, 'tables');
    
    return new Response(
      JSON.stringify({
        success: true,
        tables: data.message || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    console.error('Get tables error:', error);
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
