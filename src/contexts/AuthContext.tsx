import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

interface GoogleAuthData {
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginAsStudent: () => Promise<void>
  loginAsAdmin: (email: string, password: string) => Promise<void>
  loginWithGoogle: (data?: GoogleAuthData) => Promise<void>
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        // Only fetch profile if we don't have the user loaded or if the user ID changed
        if (!user || user.id !== session.user.id) {
          fetchProfile(session.user.id)
        }
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [user]) // Add user as dependency to avoid unnecessary fetches but keep logic sound

  const fetchProfile = async (userId: string) => {
    try {
      // Ensure loading state is true while fetching profile data
      // This prevents components from accessing incomplete user state
      if (!isLoading) setIsLoading(true)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile fetch fails, user state remains null
        return
      }

      if (profile) {
        const appUser: User = {
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          role: (profile.role as any) || 'teacher',
          avatar: profile.avatar || '',
          plan_id: profile.plan_id,
          phone: profile.phone,
          bio: profile.bio,
          onboardingCompleted: profile.onboarding_completed,
        }
        setUser(appUser)
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
    } finally {
      // Critical: Always set loading to false when data fetching is done (success or fail)
      setIsLoading(false)
    }
  }

  const checkSubscriptionAccess = () => {
    if (!user) return { allowed: false, reason: 'Not logged in' }
    if (user.role === 'admin') return { allowed: true }
    if (user.role === 'student') return { allowed: true }

    // Simple check for plan existence for now
    if (user.plan_id) {
      return { allowed: true }
    }

    return { allowed: false, reason: 'No plan active' }
  }

  const login = async (email: string, password: string) => {
    // Set loading true immediately to prevent premature redirection in Layout
    // when navigation happens before profile fetch is complete
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setIsLoading(false)
      throw error
    }
    // On success, onAuthStateChange will trigger fetchProfile
    // which eventually sets isLoading(false)
  }

  const loginAsStudent = async () => {
    // For demo purposes, this mimics "quick student login" if we have a known student
    // In production, students should login normally
    throw new Error('Função de login rápido desativada em produção.')
  }

  const loginAsAdmin = async (email: string, password: string) => {
    return login(email, password)
  }

  const loginWithGoogle = async () => {
    // OAuth redirect happens here, so loading state persists until page unload
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) {
      setIsLoading(false)
      throw error
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'teacher' | 'student',
  ) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    })
    if (error) {
      setIsLoading(false)
      throw error
    }
    // Registration might not auto-login if email confirmation is on
    // so we reset loading if no session is established immediately
    if (!data.session) {
      setIsLoading(false)
    }
  }

  const updateUser = async (data: Partial<User>) => {
    if (!user) return

    const updates: any = {
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      bio: data.bio,
      plan_id: data.plan_id,
      onboarding_completed: data.onboardingCompleted,
    }

    // Remove undefined
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key],
    )

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error

    setUser({ ...user, ...data })
  }

  const logout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsLoading(false)
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
