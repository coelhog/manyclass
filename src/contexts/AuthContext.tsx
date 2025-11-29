import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockUser, mockStudentUser, mockAdminUser } from '@/lib/mock-data'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginAsStudent: () => Promise<void>
  loginAsAdmin: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    role: 'teacher' | 'student',
  ) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('smartclass_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          // Mock logic to distinguish student vs teacher based on email for demo purposes
          // In a real app, the backend would handle this
          const isStudent = email.includes('student') || email.includes('aluno')
          const baseUser = isStudent ? mockStudentUser : mockUser

          const newUser = { ...baseUser, email }
          setUser(newUser)
          localStorage.setItem('smartclass_user', JSON.stringify(newUser))
          resolve()
        } else {
          reject(new Error('Credenciais inválidas'))
        }
      }, 1000)
    })
  }

  const loginAsStudent = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser(mockStudentUser)
        localStorage.setItem('smartclass_user', JSON.stringify(mockStudentUser))
        resolve()
      }, 500)
    })
  }

  const loginAsAdmin = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password === 'admin') {
          const adminUser = { ...mockAdminUser, email }
          setUser(adminUser)
          localStorage.setItem('smartclass_user', JSON.stringify(adminUser))
          resolve()
        } else {
          reject(new Error('Credenciais inválidas'))
        }
      }, 800)
    })
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'teacher' | 'student',
  ) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role,
          // Use generic default icon instead of random person photo
          avatar: `https://img.usecurling.com/i?q=user&color=gray&shape=fill`,
          plan_id: role === 'teacher' ? 'basic' : undefined,
        }
        setUser(newUser)
        localStorage.setItem('smartclass_user', JSON.stringify(newUser))
        resolve()
      }, 1000)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartclass_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginAsStudent,
        loginAsAdmin,
        register,
        logout,
        isLoading,
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
