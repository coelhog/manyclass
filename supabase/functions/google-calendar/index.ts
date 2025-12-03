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

    // Retrieve user's Google integration tokens
    const { data: integration } = await supabase
      .from('integrations')
      .select('config')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar') // Assuming 'google_calendar' stores the tokens
      .single()

    // In a real app, we would use integration.config.accessToken here.
    // For this mock implementation, we proceed if integration exists or if it's a demo.
    const hasIntegration = !!integration

    if (action === 'generate_meet') {
      if (!hasIntegration) {
        // Fallback or error if integration is strictly required
        // For UX, we'll generate a mock link
        console.warn('No Google integration found, generating mock link')
      }

      // Mock Google Meet Link Generation
      const meetCode = Math.random().toString(36).substring(2, 12) // e.g. 'abc-defg-hij'
      // Format: 3-4-3
      const formattedCode = `${meetCode.slice(0, 3)}-${meetCode.slice(3, 7)}-${meetCode.slice(7, 10)}`
      const meetLink = `https://meet.google.com/${formattedCode}`

      return new Response(JSON.stringify({ meetLink }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'sync_calendar') {
      if (!hasIntegration) {
        return new Response(
          JSON.stringify({
            error: 'Google Calendar integration not connected',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Mock Calendar Event Creation
      // In real implementation: Call Google Calendar API v3
      console.log('Syncing class to Google Calendar:', classDetails)

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
