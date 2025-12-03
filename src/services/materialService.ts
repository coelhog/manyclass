import { Material } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_MATERIALS = 'materials'

export const materialService = {
  getAll: async (): Promise<Material[]> => {
    await delay(500)
    return db.get<Material>(COLLECTION_MATERIALS)
  },

  create: async (
    material: Omit<Material, 'id' | 'uploadedAt'>,
  ): Promise<Material> => {
    await delay(500)
    const newMaterial: Material = {
      ...material,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString(),
    }
    return db.insert(COLLECTION_MATERIALS, newMaterial)
  },

  update: async (id: string, data: Partial<Material>): Promise<Material> => {
    await delay(300)
    return db.update(COLLECTION_MATERIALS, id, data)
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    db.delete(COLLECTION_MATERIALS, id)
  },

  getByStudentId: async (studentId: string): Promise<Material[]> => {
    const materials = await materialService.getAll()
    return materials.filter((m) => m.studentIds.includes(studentId))
  },

  getByTeacherId: async (teacherId: string): Promise<Material[]> => {
    const materials = await materialService.getAll()
    return materials.filter((m) => m.teacherId === teacherId)
  },
}
