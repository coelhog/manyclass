import { PlatformCourse } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const courseService = {
  getAll: async (): Promise<PlatformCourse[]> => {
    const { data, error } = await supabase.from('platform_courses').select('*')

    if (error) return []

    return data.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      videoUrl: c.video_url,
      isActive: c.is_active,
      createdAt: c.created_at,
    }))
  },

  create: async (
    course: Omit<PlatformCourse, 'id' | 'createdAt'>,
  ): Promise<PlatformCourse> => {
    const { data, error } = await supabase
      .from('platform_courses')
      .insert({
        title: course.title,
        description: course.description,
        video_url: course.videoUrl,
        is_active: course.isActive,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      videoUrl: data.video_url,
      isActive: data.is_active,
      createdAt: data.created_at,
    }
  },

  update: async (
    id: string,
    data: Partial<PlatformCourse>,
  ): Promise<PlatformCourse> => {
    const { data: updated, error } = await supabase
      .from('platform_courses')
      .update({
        title: data.title,
        description: data.description,
        video_url: data.videoUrl,
        is_active: data.isActive,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      videoUrl: updated.video_url,
      isActive: updated.is_active,
      createdAt: updated.created_at,
    }
  },

  delete: async (id: string): Promise<void> => {
    await supabase.from('platform_courses').delete().eq('id', id)
  },
}
