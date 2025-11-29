import { Material } from '@/types'

const MATERIALS_KEY = 'manyclass_materials'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'Grammar Guide - Basic',
    description: 'Guia completo de gramática para iniciantes.',
    fileUrl: '#',
    fileType: 'PDF',
    uploadedAt: '2024-05-01T10:00:00Z',
    studentIds: ['1', '2'],
    teacherId: '1',
  },
  {
    id: '2',
    title: 'Vocabulary List - Travel',
    description: 'Lista de vocabulário para viagens.',
    fileUrl: '#',
    fileType: 'DOCX',
    uploadedAt: '2024-05-10T14:30:00Z',
    studentIds: ['2'],
    teacherId: '1',
  },
]

export const materialService = {
  getAll: async (): Promise<Material[]> => {
    await delay(500)
    const stored = localStorage.getItem(MATERIALS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(mockMaterials))
    return mockMaterials
  },

  create: async (
    material: Omit<Material, 'id' | 'uploadedAt'>,
  ): Promise<Material> => {
    await delay(500)
    const materials = await materialService.getAll()
    const newMaterial: Material = {
      ...material,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString(),
    }
    const updated = [newMaterial, ...materials]
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(updated))
    return newMaterial
  },

  update: async (id: string, data: Partial<Material>): Promise<Material> => {
    await delay(300)
    const materials = await materialService.getAll()
    const index = materials.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Material not found')

    const updated = { ...materials[index], ...data }
    materials[index] = updated
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials))
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    const materials = await materialService.getAll()
    const filtered = materials.filter((m) => m.id !== id)
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(filtered))
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
