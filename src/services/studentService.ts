import { Student, Subscription, Payment, User } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_STUDENTS = 'students'
const COLLECTION_USERS = 'users'
const COLLECTION_CREDENTIALS = 'credentials'
const COLLECTION_SUBSCRIPTIONS = 'subscriptions'
const COLLECTION_PAYMENTS = 'payments'

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    await delay(500)
    return db.get<Student>(COLLECTION_STUDENTS)
  },

  getByTeacherId: async (teacherId: string): Promise<Student[]> => {
    await delay(300)
    const students = db.get<Student>(COLLECTION_STUDENTS)
    return students.filter((s) => s.teacherId === teacherId)
  },

  getById: async (id: string): Promise<Student | undefined> => {
    await delay(200)
    return db.getById<Student>(COLLECTION_STUDENTS, id)
  },

  create: async (
    student: Omit<Student, 'id'> & { password?: string },
  ): Promise<Student> => {
    await delay(500)

    // Check if user email already exists
    const users = db.get<User>(COLLECTION_USERS)
    if (users.find((u) => u.email === student.email)) {
      throw new Error('Este email já está em uso por outro usuário.')
    }

    const id = Math.random().toString(36).substr(2, 9)
    const avatar =
      student.avatar ||
      `https://img.usecurling.com/i?q=user&color=gray&shape=fill`

    // 1. Create User account for login
    const newUser: User = {
      id,
      name: student.name,
      email: student.email,
      role: 'student',
      avatar,
      phone: student.phone,
    }
    db.insert(COLLECTION_USERS, newUser)

    // 2. Create Credentials
    if (student.password) {
      db.insert(COLLECTION_CREDENTIALS, {
        userId: id,
        password: student.password,
      })
    }

    // 3. Create Student Profile
    const newStudent: Student = {
      id,
      teacherId: student.teacherId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      status: student.status,
      avatar,
      level: student.level,
      joinedAt: student.joinedAt || new Date().toISOString(),
      password: student.password, // Storing for reference/display to teacher
    }

    return db.insert(COLLECTION_STUDENTS, newStudent)
  },

  createBulk: async (
    studentsData: (Omit<Student, 'id'> & { password?: string })[],
  ): Promise<Student[]> => {
    await delay(800)

    const users = db.get<User>(COLLECTION_USERS)
    const createdStudents: Student[] = []

    for (const s of studentsData) {
      // Skip if email exists
      if (users.find((u) => u.email === s.email)) continue

      const id = Math.random().toString(36).substr(2, 9)
      const avatar =
        s.avatar || `https://img.usecurling.com/i?q=user&color=gray&shape=fill`

      // 1. User
      db.insert(COLLECTION_USERS, {
        id,
        name: s.name,
        email: s.email,
        role: 'student',
        avatar,
        phone: s.phone,
      })

      // 2. Credential
      if (s.password) {
        db.insert(COLLECTION_CREDENTIALS, {
          userId: id,
          password: s.password,
        })
      }

      // 3. Student Profile
      const newStudent = {
        ...s,
        id,
        avatar,
      }
      createdStudents.push(db.insert(COLLECTION_STUDENTS, newStudent))
    }

    return createdStudents
  },

  update: async (
    id: string,
    data: Partial<Student> & { password?: string },
  ): Promise<Student> => {
    await delay(300)

    // Update User info if needed
    if (data.email || data.name || data.phone) {
      try {
        const user = db.getById<User>(COLLECTION_USERS, id)
        if (user) {
          db.update(COLLECTION_USERS, id, {
            ...user,
            email: data.email || user.email,
            name: data.name || user.name,
            phone: data.phone || user.phone,
          })
        }
      } catch (e) {
        // User might not exist or other error
        console.warn('Could not update associated user record', e)
      }
    }

    // Update Password
    if (data.password) {
      const credentials = db.get<any>(COLLECTION_CREDENTIALS)
      const credIndex = credentials.findIndex((c: any) => c.userId === id)
      if (credIndex >= 0) {
        credentials[credIndex].password = data.password
        db.set(COLLECTION_CREDENTIALS, credentials)
      } else {
        db.insert(COLLECTION_CREDENTIALS, {
          userId: id,
          password: data.password,
        })
      }
    }

    const { password, ...studentData } = data
    // We can keep password in student record for display if needed, or remove it.
    // Current implementation keeps it in Student type for teacher visibility.
    return db.update(COLLECTION_STUDENTS, id, {
      ...studentData,
      password: data.password,
    })
  },

  delete: async (id: string): Promise<void> => {
    await delay(300)
    db.delete(COLLECTION_STUDENTS, id)
    db.delete(COLLECTION_USERS, id)
    // Also remove credentials
    const credentials = db.get<any>(COLLECTION_CREDENTIALS)
    const newCredentials = credentials.filter((c: any) => c.userId !== id)
    db.set(COLLECTION_CREDENTIALS, newCredentials)
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
