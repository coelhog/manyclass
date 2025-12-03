import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, userId, classDetails } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Retrieve user's Google integration tokens from DB
    const { data: integration } = await supabase
      .from('integrations')
      .select('config')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single()

    // Logic to check if integration is active
    // in real app: const accessToken = integration?.config?.accessToken;
    const hasIntegration = !!integration && integration.config?.accessToken

    if (action === 'generate_meet') {
      if (!hasIntegration) {
        console.warn(
          'No Google integration found for user, falling back to mock link',
        )
      }

      // Mock Google Meet Link Generation (Real implementation would use Calendar API 'conferenceData')
      const meetCode = Math.random().toString(36).substring(2, 12)
      const formattedCode = `${meetCode.slice(0, 3)}-${meetCode.slice(3, 7)}-${meetCode.slice(7, 10)}`
      const meetLink = `https://meet.google.com/${formattedCode}`

      return new Response(JSON.stringify({ meetLink }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'sync_calendar') {
      if (!hasIntegration) {
        // We allow soft fail if integration isn't there, or return specific error
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Google Calendar integration not connected',
          }),
          {
            status: 200, // Soft fail
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Mock Calendar Event Creation using tokens
      console.log('Syncing class to Google Calendar:', classDetails)
      // In real app: use googleapis to insert event

      const eventId = `gcal_${Math.random().toString(36).substring(2, 15)}`

      return new Response(JSON.stringify({ success: true, eventId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in google-calendar function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
