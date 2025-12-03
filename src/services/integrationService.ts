import { Integration, IntegrationConfig, IntegrationProvider } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_INTEGRATIONS = 'integrations'

const defaultIntegrations: Integration[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    provider: 'google_calendar',
    type: 'oauth',
    status: 'disconnected',
    logo: 'https://img.usecurling.com/i?q=google-calendar&color=multicolor',
    description:
      'Sincronize suas aulas e tarefas automaticamente com sua agenda do Google.',
    config: {
      syncToPersonalCalendar: true,
    },
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    provider: 'google_meet',
    type: 'oauth',
    status: 'disconnected',
    logo: 'https://img.usecurling.com/i?q=google-meet&color=multicolor',
    description:
      'Crie links de reunião automaticamente para suas aulas online.',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    provider: 'zoom',
    type: 'oauth',
    status: 'disconnected',
    logo: 'https://img.usecurling.com/i?q=zoom&color=blue',
    description:
      'Integre com o Zoom para agendamento e gestão de videochamadas.',
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    provider: 'microsoft_teams',
    type: 'oauth',
    status: 'disconnected',
    logo: 'https://img.usecurling.com/i?q=microsoft-teams&color=multicolor',
    description: 'Utilize o Microsoft Teams para suas salas de aula virtuais.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    provider: 'whatsapp',
    type: 'api_key',
    status: 'disconnected',
    logo: 'https://img.usecurling.com/i?q=whatsapp&color=green',
    description:
      'Envie lembretes de aula e cobranças automaticamente via WhatsApp.',
    planRequired: 'intermediate',
  },
  {
    id: 'asaas',
    name: 'Asaas',
    provider: 'asaas',
    type: 'api_key',
    status: 'disconnected',
    logo: 'https://img.usecurling.com/i?q=wallet&color=blue',
    description:
      'Automatize cobranças, boletos e pix através da integração com Asaas.',
  },
]

export const integrationService = {
  getAll: async (): Promise<Integration[]> => {
    await delay(500)
    const integrations = db.get<Integration>(COLLECTION_INTEGRATIONS)

    if (integrations.length > 0) {
      // Merge with default to ensure all providers exist
      return defaultIntegrations.map((def) => {
        const existing = integrations.find((s) => s.id === def.id)
        return existing
          ? {
              ...def,
              ...existing,
              config: { ...def.config, ...existing.config },
            }
          : def
      })
    }

    db.set(COLLECTION_INTEGRATIONS, defaultIntegrations)
    return defaultIntegrations
  },

  getById: async (id: string): Promise<Integration | undefined> => {
    const integrations = await integrationService.getAll()
    return integrations.find((i) => i.id === id)
  },

  getByProvider: async (
    provider: IntegrationProvider,
  ): Promise<Integration | undefined> => {
    const integrations = await integrationService.getAll()
    return integrations.find((i) => i.provider === provider)
  },

  connect: async (
    id: string,
    config?: IntegrationConfig,
  ): Promise<Integration> => {
    await delay(1000)
    const integrations = await integrationService.getAll()
    const index = integrations.findIndex((i) => i.id === id)
    if (index === -1) throw new Error('Integration not found')

    // Simulate receiving tokens
    const mockToken = `mock_token_${Math.random().toString(36).substr(2)}`
    localStorage.setItem(`token_${id}`, mockToken)

    const updated = {
      ...integrations[index],
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      config: { ...integrations[index].config, ...config },
    }

    // Persist full list back
    integrations[index] = updated
    db.set(COLLECTION_INTEGRATIONS, integrations)

    return updated
  },

  disconnect: async (id: string): Promise<Integration> => {
    await delay(500)
    const integrations = await integrationService.getAll()
    const index = integrations.findIndex((i) => i.id === id)
    if (index === -1) throw new Error('Integration not found')

    localStorage.removeItem(`token_${id}`)

    const updated = {
      ...integrations[index],
      status: 'disconnected' as const,
      connectedAt: undefined,
      config: defaultIntegrations.find((d) => d.id === id)?.config,
    }

    integrations[index] = updated
    db.set(COLLECTION_INTEGRATIONS, integrations)

    return updated
  },

  updateConfig: async (
    id: string,
    config: IntegrationConfig,
  ): Promise<Integration> => {
    await delay(300)
    const integrations = await integrationService.getAll()
    const index = integrations.findIndex((i) => i.id === id)
    if (index === -1) throw new Error('Integration not found')

    const updated = {
      ...integrations[index],
      config: { ...integrations[index].config, ...config },
    }

    integrations[index] = updated
    db.set(COLLECTION_INTEGRATIONS, integrations)

    return updated
  },

  isConnected: async (provider: IntegrationProvider): Promise<boolean> => {
    const integrations = db.get<Integration>(COLLECTION_INTEGRATIONS)
    const integration = integrations.find((i) => i.provider === provider)
    return integration?.status === 'connected'
  },
}
