import { AutomatedMessage } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_MESSAGES = 'messages'

export const messageService = {
  getAll: async (): Promise<AutomatedMessage[]> => {
    await delay(500)
    return db.get<AutomatedMessage>(COLLECTION_MESSAGES)
  },

  update: async (
    id: string,
    data: Partial<AutomatedMessage>,
  ): Promise<AutomatedMessage> => {
    await delay(300)
    return db.update(COLLECTION_MESSAGES, id, data)
  },

  create: async (
    data: Omit<AutomatedMessage, 'id'>,
  ): Promise<AutomatedMessage> => {
    await delay(300)
    const newMessage = { ...data, id: Math.random().toString(36).substr(2, 9) }
    return db.insert(COLLECTION_MESSAGES, newMessage)
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    db.delete(COLLECTION_MESSAGES, id)
  },
}
