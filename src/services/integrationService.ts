import { Integration, IntegrationConfig, IntegrationProvider } from '@/types'

const INTEGRATIONS_KEY = 'manyclass_integrations'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
    const stored = localStorage.getItem(INTEGRATIONS_KEY)
    if (stored) {
      const storedIntegrations = JSON.parse(stored) as Integration[]
      // Merge with default to ensure all providers exist if new ones are added
      return defaultIntegrations.map((def) => {
        const existing = storedIntegrations.find((s) => s.id === def.id)
        return existing
          ? {
              ...def,
              ...existing,
              config: { ...def.config, ...existing.config },
            }
          : def
      })
    }
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(defaultIntegrations))
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
    await delay(1000) // Simulate network request
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
    integrations[index] = updated
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations))
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
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations))
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
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations))
    return updated
  },

  isConnected: async (provider: IntegrationProvider): Promise<boolean> => {
    // Helper mostly for internal service use (synchronous check if possible, but storage is sync)
    const stored = localStorage.getItem(INTEGRATIONS_KEY)
    if (!stored) return false
    const integrations = JSON.parse(stored) as Integration[]
    const integration = integrations.find((i) => i.provider === provider)
    return integration?.status === 'connected'
  },
}
