import { Integration } from '@/types'

const INTEGRATIONS_KEY = 'smartclass_integrations'

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
        return existing ? { ...def, ...existing } : def
      })
    }
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(defaultIntegrations))
    return defaultIntegrations
  },

  connect: async (
    id: string,
    config?: Record<string, any>,
  ): Promise<Integration> => {
    await delay(1000) // Simulate network request
    const integrations = await integrationService.getAll()
    const index = integrations.findIndex((i) => i.id === id)
    if (index === -1) throw new Error('Integration not found')

    const updated = {
      ...integrations[index],
      status: 'connected' as const,
      connectedAt: new Date().toISOString(),
      config: config || {},
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

    const updated = {
      ...integrations[index],
      status: 'disconnected' as const,
      connectedAt: undefined,
      config: undefined,
    }
    integrations[index] = updated
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations))
    return updated
  },
}
