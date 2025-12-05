import { supabase } from '@/lib/supabase/client'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  from?: string
}

export const emailService = {
  sendEmail: async (params: SendEmailParams) => {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    return data
  },

  sendWelcomeEmail: async (to: string, name: string) => {
    return emailService.sendEmail({
      to,
      subject: 'Bem-vindo ao SmartClassHub',
      html: `
        <h1>Olá, ${name}!</h1>
        <p>Estamos muito felizes em ter você conosco.</p>
        <p>Acesse sua conta para começar: <a href="${window.location.origin}/login">Login</a></p>
      `,
    })
  },
}
