import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
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

  // Use ref to track user state for effect comparisons without adding to deps
  const userRef = useRef(user)
  const isMounted = useRef(true)
  // Prevents duplicate fetches for the same user ID
  const fetchingIdRef = useRef<string | null>(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const fetchProfile = useCallback(async (userId: string) => {
    // Prevent duplicate fetches for the same user
    if (fetchingIdRef.current === userId) return

    try {
      fetchingIdRef.current = userId
      // Only set loading to true if it's not already (though usually safe to set)
      setIsLoading(true)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!isMounted.current) return

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile fetch fails (e.g., data inconsistency), sign out to reset state
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
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
      } else {
        // User exists in auth but not profiles (rare edge case), logout or handle gracefully
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } finally {
      fetchingIdRef.current = null
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (isMounted.current) {
        setSession(currentSession)
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id)
        } else {
          setUser(null)
          setIsLoading(false)
        }
      }
    })

    // Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted.current) return

      setSession(currentSession)

      if (currentSession?.user) {
        // If user is different or not loaded, fetch
        if (!userRef.current || userRef.current.id !== currentSession.user.id) {
          fetchProfile(currentSession.user.id)
        } else {
          // User already loaded and matches session, ensure loading is false
          setIsLoading(false)
        }
      } else {
        // No session
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const checkSubscriptionAccess = () => {
    if (!user) return { allowed: false, reason: 'Not logged in' }
    if (user.role === 'admin') return { allowed: true }
    if (user.role === 'student') return { allowed: true }

    // Simplified check for teachers - assumes valid plan if plan_id exists
    if (user.plan_id) {
      return { allowed: true }
    }

    return { allowed: false, reason: 'No plan active' }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setIsLoading(false)
      throw error
    }
    // onAuthStateChange will handle the rest
  }

  const loginAsStudent = async () => {
    throw new Error('Função de login rápido desativada em produção.')
  }

  const loginAsAdmin = async (email: string, password: string) => {
    return login(email, password)
  }

  const loginWithGoogle = async () => {
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
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) {
      setIsLoading(false)
      throw error
    }
    // If email confirmation is required (which it is by default), session might be null
    // We stop loading here so the UI can show the success message
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

    // Remove undefined keys
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
