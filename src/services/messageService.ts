import { AutomatedMessage } from '@/types'

const MESSAGES_KEY = 'smartclass_messages'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockMessages: AutomatedMessage[] = [
  {
    id: '1',
    title: 'Lembrete de Aula',
    type: 'class_reminder',
    template: 'Olá {nomedoaluno}, sua aula começa em 30 minutos! Link: {link}',
    isActive: true,
    timing: '30_min_before',
  },
  {
    id: '2',
    title: 'Lembrete de Pagamento',
    type: 'payment_reminder',
    template:
      'Olá {nomedoaluno}, seu link de pagamento desse mês já está disponível.',
    isActive: true,
    timing: 'on_due_date',
  },
  {
    id: '3',
    title: 'Reengajamento',
    type: 're_engagement',
    template:
      'Oi {nomedoaluno}, estamos sentindo sua falta. Retorne já com 10%OFF usando o cupom VOLTA10.',
    isActive: false,
    timing: '30_days_inactive',
  },
]

export const messageService = {
  getAll: async (): Promise<AutomatedMessage[]> => {
    await delay(500)
    const stored = localStorage.getItem(MESSAGES_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(mockMessages))
    return mockMessages
  },

  update: async (
    id: string,
    data: Partial<AutomatedMessage>,
  ): Promise<AutomatedMessage> => {
    await delay(300)
    const messages = await messageService.getAll()
    const index = messages.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Message not found')

    const updated = { ...messages[index], ...data }
    messages[index] = updated
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
    return updated
  },

  create: async (
    data: Omit<AutomatedMessage, 'id'>,
  ): Promise<AutomatedMessage> => {
    await delay(300)
    const messages = await messageService.getAll()
    const newMessage = { ...data, id: Math.random().toString(36).substr(2, 9) }
    const updated = [...messages, newMessage]
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated))
    return newMessage
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    const messages = await messageService.getAll()
    const filtered = messages.filter((m) => m.id !== id)
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(filtered))
  },
}
