import { AutomatedMessage } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const messageService = {
  getAll: async (): Promise<AutomatedMessage[]> => {
    const { data, error } = await supabase
      .from('automated_messages')
      .select('*')
    if (error) return []

    return data.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type as any,
      template: m.template,
      isActive: m.is_active,
      timing: m.timing,
    }))
  },

  update: async (
    id: string,
    data: Partial<AutomatedMessage>,
  ): Promise<AutomatedMessage> => {
    const { data: updated, error } = await supabase
      .from('automated_messages')
      .update({
        title: data.title,
        template: data.template,
        is_active: data.isActive,
        timing: data.timing,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: updated.id,
      title: updated.title,
      type: updated.type as any,
      template: updated.template,
      isActive: updated.is_active,
      timing: updated.timing,
    }
  },

  create: async (
    data: Omit<AutomatedMessage, 'id'>,
  ): Promise<AutomatedMessage> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: created, error } = await supabase
      .from('automated_messages')
      .insert({
        user_id: user?.id,
        title: data.title,
        type: data.type,
        template: data.template,
        is_active: data.isActive,
        timing: data.timing,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: created.id,
      title: created.title,
      type: created.type as any,
      template: created.template,
      isActive: created.is_active,
      timing: created.timing,
    }
  },

  delete: async (id: string): Promise<void> => {
    await supabase.from('automated_messages').delete().eq('id', id)
  },
}
