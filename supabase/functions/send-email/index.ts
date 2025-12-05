import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface EmailRequest {
  to: string
  subject: string
  html: string
  from?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, from }: EmailRequest = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // This is where you would integrate with SendGrid, Resend, Mailgun, etc.
    // For this implementation, we will simulate a successful send or log it.
    // In a real scenario, use Deno.env.get('RESEND_API_KEY') etc.

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (RESEND_API_KEY) {
      // Example integration with Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: from || 'onboarding@resend.dev',
          to,
          subject,
          html,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data }), {
          status: res.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fallback simulation if no API key is present
    console.log(`[Mock Email Service] Sending email to ${to}: ${subject}`)

    return new Response(
      JSON.stringify({
        message: 'Email queued successfully (Mock)',
        id: crypto.randomUUID(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
