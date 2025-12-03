import { PlatformCourse } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_COURSES = 'platform_courses'

export const courseService = {
  getAll: async (): Promise<PlatformCourse[]> => {
    await delay(500)
    return db.get<PlatformCourse>(COLLECTION_COURSES)
  },

  getById: async (id: string): Promise<PlatformCourse | undefined> => {
    await delay(200)
    return db.getById<PlatformCourse>(COLLECTION_COURSES, id)
  },

  create: async (
    course: Omit<PlatformCourse, 'id' | 'createdAt'>,
  ): Promise<PlatformCourse> => {
    await delay(500)
    const newCourse: PlatformCourse = {
      ...course,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    return db.insert(COLLECTION_COURSES, newCourse)
  },

  update: async (
    id: string,
    data: Partial<PlatformCourse>,
  ): Promise<PlatformCourse> => {
    await delay(300)
    return db.update(COLLECTION_COURSES, id, data)
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    db.delete(COLLECTION_COURSES, id)
  },
}
