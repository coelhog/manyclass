import { User } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_USERS = 'users'

export const teacherService = {
  getAll: async (): Promise<User[]> => {
    await delay(500)
    const users = db.get<User>(COLLECTION_USERS)
    return users.filter((u) => u.role === 'teacher')
  },

  getById: async (id: string): Promise<User | undefined> => {
    await delay(200)
    return db.getById<User>(COLLECTION_USERS, id)
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(300)
    return db.update(COLLECTION_USERS, id, data)
  },
}
