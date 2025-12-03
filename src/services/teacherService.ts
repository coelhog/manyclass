import { User } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const teacherService = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'teacher')

    if (error) {
      console.error('Error fetching teachers:', error)
      return []
    }

    return data.map((profile) => ({
      id: profile.id,
      name: profile.name || '',
      email: profile.email || '',
      role: 'teacher',
      avatar: profile.avatar || '',
      plan_id: profile.plan_id,
      phone: profile.phone,
      bio: profile.bio,
    }))
  },

  getById: async (id: string): Promise<User | undefined> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !profile) {
      return undefined
    }

    return {
      id: profile.id,
      name: profile.name || '',
      email: profile.email || '',
      role: (profile.role as any) || 'teacher',
      avatar: profile.avatar || '',
      plan_id: profile.plan_id,
      phone: profile.phone,
      bio: profile.bio,
    }
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const updates: any = {
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      bio: data.bio,
      plan_id: data.plan_id,
    }

    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key],
    )

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: updated.id,
      name: updated.name || '',
      email: updated.email || '',
      role: updated.role as any,
      avatar: updated.avatar || '',
      plan_id: updated.plan_id,
      phone: updated.phone,
      bio: updated.bio,
    }
  },
}
