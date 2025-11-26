import { Student, Subscription, Payment } from '@/types'
import { mockStudents, mockSubscriptions, mockPayments } from '@/lib/mock-data'

const STORAGE_KEY = 'smartclass_students'
const SUBSCRIPTIONS_KEY = 'smartclass_subscriptions'
const PAYMENTS_KEY = 'smartclass_payments'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    await delay(500)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockStudents))
    return mockStudents
  },

  getById: async (id: string): Promise<Student | undefined> => {
    const students = await studentService.getAll()
    return students.find((s) => s.id === id)
  },

  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    await delay(500)
    const students = await studentService.getAll()
    const newStudent = {
      ...student,
      id: Math.random().toString(36).substr(2, 9),
    }
    const updated = [...students, newStudent]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return newStudent
  },

  update: async (id: string, data: Partial<Student>): Promise<Student> => {
    await delay(300)
    const students = await studentService.getAll()
    const index = students.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Student not found')
    const updated = { ...students[index], ...data }
    students[index] = updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    const students = await studentService.getAll()
    const filtered = students.filter((s) => s.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  },

  // Subscriptions
  getSubscriptionByStudentId: async (
    studentId: string,
  ): Promise<Subscription | undefined> => {
    await delay(300)
    const stored = localStorage.getItem(SUBSCRIPTIONS_KEY)
    const subscriptions: Subscription[] = stored
      ? JSON.parse(stored)
      : mockSubscriptions
    return subscriptions.find((s) => s.studentId === studentId)
  },

  createSubscription: async (
    sub: Omit<Subscription, 'id'>,
  ): Promise<Subscription> => {
    const stored = localStorage.getItem(SUBSCRIPTIONS_KEY)
    const subscriptions: Subscription[] = stored
      ? JSON.parse(stored)
      : mockSubscriptions
    const newSub = { ...sub, id: Math.random().toString(36).substr(2, 9) }
    const updated = [...subscriptions, newSub]
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated))
    return newSub
  },

  // Payments
  getAllPayments: async (): Promise<Payment[]> => {
    await delay(300)
    const stored = localStorage.getItem(PAYMENTS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(mockPayments))
    return mockPayments
  },

  createPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    await delay(300)
    const payments = await studentService.getAllPayments()
    const newPayment = {
      ...payment,
      id: Math.random().toString(36).substr(2, 9),
    }
    const updated = [...payments, newPayment]
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updated))
    return newPayment
  },
}
