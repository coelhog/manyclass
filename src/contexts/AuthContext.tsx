import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockUser, mockStudentUser, mockAdminUser } from '@/lib/mock-data'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginAsStudent: () => Promise<void>
  loginAsAdmin: (password: string) => Promise<void>
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
          const newUser = { ...mockUser, email }
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

  const loginAsAdmin = async (password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (password === 'admin') {
          setUser(mockAdminUser)
          localStorage.setItem('smartclass_user', JSON.stringify(mockAdminUser))
          resolve()
        } else {
          reject(new Error('Senha inválida'))
        }
      }, 800)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('smartclass_user')
  }

  return (
    <AuthContext.Provider
      value={{ user, login, loginAsStudent, loginAsAdmin, logout, isLoading }}
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
