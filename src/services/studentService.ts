import { Student, Subscription, Payment } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_STUDENTS = 'students'
const COLLECTION_SUBSCRIPTIONS = 'subscriptions'
const COLLECTION_PAYMENTS = 'payments'

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    await delay(500)
    return db.get<Student>(COLLECTION_STUDENTS)
  },

  getById: async (id: string): Promise<Student | undefined> => {
    await delay(200)
    return db.getById<Student>(COLLECTION_STUDENTS, id)
  },

  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    await delay(500)
    const newStudent = {
      ...student,
      id: Math.random().toString(36).substr(2, 9),
      avatar:
        student.avatar ||
        `https://img.usecurling.com/i?q=user&color=gray&shape=fill`,
    }
    return db.insert(COLLECTION_STUDENTS, newStudent)
  },

  createBulk: async (
    studentsData: Omit<Student, 'id'>[],
  ): Promise<Student[]> => {
    await delay(800)
    const newStudents = studentsData.map((s) => ({
      ...s,
      id: Math.random().toString(36).substr(2, 9),
      avatar:
        s.avatar || `https://img.usecurling.com/i?q=user&color=gray&shape=fill`,
    }))
    return db.insertMany(COLLECTION_STUDENTS, newStudents)
  },

  update: async (id: string, data: Partial<Student>): Promise<Student> => {
    await delay(300)
    return db.update(COLLECTION_STUDENTS, id, data)
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    db.delete(COLLECTION_STUDENTS, id)
  },

  // Subscriptions
  getSubscriptionByStudentId: async (
    studentId: string,
  ): Promise<Subscription | undefined> => {
    await delay(300)
    const subscriptions = db.get<Subscription>(COLLECTION_SUBSCRIPTIONS)
    return subscriptions.find((s) => s.studentId === studentId)
  },

  createSubscription: async (
    sub: Omit<Subscription, 'id'>,
  ): Promise<Subscription> => {
    const newSub = { ...sub, id: Math.random().toString(36).substr(2, 9) }
    return db.insert(COLLECTION_SUBSCRIPTIONS, newSub)
  },

  // Payments
  getAllPayments: async (): Promise<Payment[]> => {
    await delay(300)
    return db.get<Payment>(COLLECTION_PAYMENTS)
  },

  createPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    await delay(300)
    const newPayment = {
      ...payment,
      id: Math.random().toString(36).substr(2, 9),
    }
    return db.insert(COLLECTION_PAYMENTS, newPayment)
  },
}
