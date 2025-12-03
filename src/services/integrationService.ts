import { Integration, IntegrationConfig, IntegrationProvider } from '@/types'
import { supabase } from '@/lib/supabase/client'

const defaultIntegrationsList = [
  {
    integration_id: 'google_calendar',
    name: 'Google Calendar',
    provider: 'google_calendar',
    type: 'oauth',
    logo: 'https://img.usecurling.com/i?q=google-calendar&color=multicolor',
    description: 'Sincronize suas aulas com o Google.',
  },
  // ... other defaults mapped in getAll
]

export const integrationService = {
  getAll: async (): Promise<Integration[]> => {
    const { data, error } = await supabase.from('integrations').select('*')

    if (error) return []

    // Merge with static definitions
    const defaults = [
      {
        id: 'google_calendar',
        name: 'Google Calendar',
        provider: 'google_calendar',
        type: 'oauth',
        logo: 'https://img.usecurling.com/i?q=google-calendar&color=multicolor',
        description: 'Sincronize sua agenda.',
      },
      {
        id: 'google_meet',
        name: 'Google Meet',
        provider: 'google_meet',
        type: 'oauth',
        logo: 'https://img.usecurling.com/i?q=google-meet&color=multicolor',
        description: 'Links automáticos para aulas.',
      },
      {
        id: 'zoom',
        name: 'Zoom',
        provider: 'zoom',
        type: 'oauth',
        logo: 'https://img.usecurling.com/i?q=zoom&color=blue',
        description: 'Integração com Zoom.',
      },
      {
        id: 'asaas',
        name: 'Asaas',
        provider: 'asaas',
        type: 'api_key',
        logo: 'https://img.usecurling.com/i?q=wallet&color=blue',
        description: 'Gestão financeira.',
      },
    ]

    return defaults.map((def) => {
      const stored = data.find((d) => d.integration_id === def.id)
      return {
        ...def,
        id: def.id, // Use ID from static def as primary key for UI logic
        status: (stored?.status as any) || 'disconnected',
        config: stored?.config,
        connectedAt: stored?.connected_at,
      } as Integration
    })
  },

  connect: async (
    integrationId: string,
    config?: IntegrationConfig,
  ): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    await supabase.from('integrations').upsert(
      {
        user_id: user.id,
        integration_id: integrationId,
        provider: integrationId, // Simplified mapping
        status: 'connected',
        config: config || {},
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, integration_id' },
    )
  },

  disconnect: async (integrationId: string): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('integrations')
      .update({ status: 'disconnected', connected_at: null })
      .eq('user_id', user.id)
      .eq('integration_id', integrationId)
  },

  updateConfig: async (
    integrationId: string,
    config: IntegrationConfig,
  ): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Fetch existing to merge
    const { data: existing } = await supabase
      .from('integrations')
      .select('config')
      .eq('user_id', user.id)
      .eq('integration_id', integrationId)
      .single()

    const newConfig = { ...existing?.config, ...config }

    await supabase
      .from('integrations')
      .update({ config: newConfig })
      .eq('user_id', user.id)
      .eq('integration_id', integrationId)
  },

  getByProvider: async (
    provider: IntegrationProvider,
  ): Promise<Integration | undefined> => {
    const all = await integrationService.getAll()
    return all.find((i) => i.provider === provider)
  },

  isConnected: async (provider: IntegrationProvider): Promise<boolean> => {
    const i = await integrationService.getByProvider(provider)
    return i?.status === 'connected'
  },
}
