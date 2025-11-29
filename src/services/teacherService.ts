import { User } from '@/types'

const TEACHERS_KEY = 'smartclass_teachers'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockTeachers: User[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@smartclass.com',
    role: 'teacher',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female',
    plan_id: 'premium',
    phone: '(11) 99999-9999',
    bio: 'Professora de Inglês com 10 anos de experiência.',
  },
  {
    id: '2',
    name: 'Roberto Carlos',
    email: 'roberto@email.com',
    role: 'teacher',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=2',
    plan_id: 'basic',
    phone: '(11) 88888-8888',
    bio: 'Especialista em Espanhol para negócios.',
  },
  {
    id: '3',
    name: 'Julia Roberts',
    email: 'julia@email.com',
    role: 'teacher',
    avatar: 'https://img.usecurling.com/ppl/medium?gender=female&seed=3',
    plan_id: 'intermediate',
    phone: '(11) 77777-7777',
    bio: 'Ensino Francês e Italiano.',
  },
]

export const teacherService = {
  getAll: async (): Promise<User[]> => {
    await delay(500)
    const stored = localStorage.getItem(TEACHERS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(mockTeachers))
    return mockTeachers
  },

  getById: async (id: string): Promise<User | undefined> => {
    const teachers = await teacherService.getAll()
    return teachers.find((t) => t.id === id)
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(300)
    const teachers = await teacherService.getAll()
    const index = teachers.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Teacher not found')

    const updated = { ...teachers[index], ...data }
    teachers[index] = updated
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers))
    return updated
  },
}
