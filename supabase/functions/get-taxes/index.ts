import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sid, title } = await req.json()

    if (!sid) {
      console.error('Missing sid in request')
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get session credentials from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('api_key, api_secret')
      .eq('sid', sid)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (sessionError || !session) {
      console.error('Session lookup failed:', sessionError?.message || 'Session not found or expired')
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the API URL with optional title filter
    let apiUrl = 'https://restodemo.sopwer.id/api/resource/Sales Taxes and Charges Template?fields=["name","title"]&limit_page_length=20'
    
    if (title) {
      const filters = JSON.stringify([["title", "=", title]])
      apiUrl += `&filters=${encodeURIComponent(filters)}`
    }

    console.log('Fetching taxes from:', apiUrl)

    // Call external API with credentials
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `token ${session.api_key}:${session.api_secret}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('External API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch taxes', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log('Taxes fetched successfully:', data.data?.length || 0, 'items')

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Get taxes error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
