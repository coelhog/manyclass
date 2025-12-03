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
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    const { email, password, name, role, phone, user_metadata } =
      await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: user, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: role || 'student',
          phone: phone,
          ...user_metadata,
        },
      })

    if (createError) {
      throw createError
    }

    // Handle profile creation if trigger doesn't cover it completely or if we need specific fields immediately
    // The existing trigger `on_auth_user_created` handles profile creation based on user_metadata
    // However, if phone is passed, we might want to ensure it's in the profile
    if (user.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: name,
          role: role || 'student',
          phone: phone,
        })
        .eq('id', user.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }
    }

    return new Response(JSON.stringify(user), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
