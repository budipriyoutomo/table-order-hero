import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sid } = await req.json();

    if (!sid) {
      console.error('Missing session ID');
      return new Response(
        JSON.stringify({ error: 'Session ID required', code: 'MISSING_SID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase client with service role to access sessions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Retrieve session from database
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('api_key, api_secret, expires_at')
      .eq('sid', sid)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Session expired, please login again', code: 'SESSION_EXPIRED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      console.error('Session expired at:', session.expires_at);
      return new Response(
        JSON.stringify({ error: 'Session expired, please login again', code: 'SESSION_EXPIRED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.info('Fetching menu with server-side credentials...');

    // Create auth token for external API
    const authToken = btoa(`${session.api_key}:${session.api_secret}`);

    // Fetch menu from external API
    const menuResponse = await fetch(
      'https://restodemo.sopwer.id/api/resource/Branch Menu?fields=["*"]&limit_page_length=0',
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Accept': 'application/json',
        },
      }
    );

    console.info('Menu response status:', menuResponse.status);

    if (!menuResponse.ok) {
      const errorText = await menuResponse.text();
      console.error('Menu API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch menu', details: errorText }),
        { status: menuResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const menuData = await menuResponse.json();
    const menuItems = menuData.data || [];

    console.info(`Successfully fetched ${menuItems.length} menu items`);

    return new Response(
      JSON.stringify({ success: true, menu: menuItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get menu error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
