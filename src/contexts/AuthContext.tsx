import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, PlanType } from '@/types'
import { db } from '@/lib/db'
import { differenceInDays, isPast, parseISO } from 'date-fns'
import { onboardingService } from '@/services/onboardingService'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginAsStudent: () => Promise<void>
  loginAsAdmin: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    role: 'teacher' | 'student',
  ) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
  isLoading: boolean
  checkSubscriptionAccess: () => { allowed: boolean; reason?: string }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const COLLECTION_USERS = 'users'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('manyclass_current_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Initialize Admin if not exists (Seed)
    const users = db.get<User>(COLLECTION_USERS)
    const adminExists = users.find((u) => u.role === 'admin')
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-seed',
        name: 'Administrador',
        email: 'admin@smartclass.com',
        role: 'admin',
        avatar: 'https://img.usecurling.com/i?q=shield&color=blue',
      }
      db.insert(COLLECTION_USERS, adminUser)
      db.insert('credentials', { userId: adminUser.id, password: 'admin' })
    }

    // Ensure questions are seeded
    onboardingService.getQuestions()

    setIsLoading(false)
  }, [])

  const checkSubscriptionAccess = () => {
    if (!user) return { allowed: false, reason: 'Not logged in' }
    if (user.role === 'admin') return { allowed: true }
    if (user.role === 'student') return { allowed: true } // Students don't pay platform fee

    // Teachers logic
    const isTrialActive =
      user.trialEndsAt && !isPast(parseISO(user.trialEndsAt))
    const hasActivePlan =
      user.subscriptionStatus === 'active' && user.plan_id !== undefined

    if (isTrialActive || hasActivePlan) {
      return { allowed: true }
    }

    return { allowed: false, reason: 'Subscription expired' }
  }

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = db.get<User>(COLLECTION_USERS)
        const credentials = db.get<any>('credentials')

        const userFound = users.find((u) => u.email === email)

        if (userFound) {
          const cred = credentials.find((c: any) => c.userId === userFound.id)
          if (cred && cred.password === password) {
            // Update local user state
            setUser(userFound)
            localStorage.setItem(
              'manyclass_current_user',
              JSON.stringify(userFound),
            )
            resolve()
            return
          }
        }
        reject(new Error('Credenciais inválidas'))
      }, 1000)
    })
  }

  const loginAsStudent = async () => {
    return new Promise<void>((resolve, reject) => {
      const users = db.get<User>(COLLECTION_USERS)
      const student = users.find((u) => u.role === 'student')
      if (student) {
        setUser(student)
        localStorage.setItem('manyclass_current_user', JSON.stringify(student))
        resolve()
      } else {
        reject(new Error('Nenhum aluno registrado para login rápido.'))
      }
    })
  }

  const loginAsAdmin = async (email: string, password: string) => {
    return login(email, password)
  }

  const loginWithGoogle = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Mock Google User
        const googleEmail = 'teacher@gmail.com'
        const users = db.get<User>(COLLECTION_USERS)
        let userFound = users.find((u) => u.email === googleEmail)

        if (!userFound) {
          // Register if not found
          const trialEndDate = new Date()
          trialEndDate.setDate(trialEndDate.getDate() + 7)

          userFound = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Professor Google',
            email: googleEmail,
            role: 'teacher',
            avatar: `https://img.usecurling.com/i?q=google&color=multicolor&shape=fill`,
            plan_id: 'basic',
            trialEndsAt: trialEndDate.toISOString(),
            subscriptionStatus: 'trial',
            onboardingCompleted: false,
          }
          db.insert(COLLECTION_USERS, userFound)
        }

        setUser(userFound)
        localStorage.setItem(
          'manyclass_current_user',
          JSON.stringify(userFound),
        )
        resolve()
      }, 1500)
    })
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'teacher' | 'student',
  ) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = db.get<User>(COLLECTION_USERS)
        if (users.find((u) => u.email === email)) {
          reject(new Error('Email já cadastrado'))
          return
        }

        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + 7)

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role,
          avatar: `https://img.usecurling.com/i?q=user&color=gray&shape=fill`,
          plan_id: role === 'teacher' ? 'basic' : undefined,
          trialEndsAt:
            role === 'teacher' ? trialEndDate.toISOString() : undefined,
          subscriptionStatus: role === 'teacher' ? 'trial' : 'active',
          onboardingCompleted: false,
        }

        db.insert(COLLECTION_USERS, newUser)
        db.insert('credentials', { userId: newUser.id, password })

        if (role === 'student') {
          db.insert('students', {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: '',
            status: 'active',
            avatar: newUser.avatar,
            level: 'Iniciante',
            joinedAt: new Date().toISOString(),
            password: password,
          })
        }

        setUser(newUser)
        localStorage.setItem('manyclass_current_user', JSON.stringify(newUser))
        resolve()
      }, 1000)
    })
  }

  const updateUser = async (data: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
    localStorage.setItem('manyclass_current_user', JSON.stringify(updatedUser))
    db.update(COLLECTION_USERS, user.id, data)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('manyclass_current_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginAsStudent,
        loginAsAdmin,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        isLoading,
        checkSubscriptionAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
