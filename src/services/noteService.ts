import { ClassNote } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const noteService = {
  getAll: async (): Promise<ClassNote[]> => {
    const { data, error } = await supabase.from('class_notes').select('*')
    if (error) return []
    return data.map((n) => ({
      id: n.id,
      eventId: n.event_id,
      classId: n.class_id,
      studentId: n.student_id,
      teacherId: n.teacher_id,
      content: n.content,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }))
  },

  getByStudentId: async (studentId: string): Promise<ClassNote[]> => {
    const { data, error } = await supabase
      .from('class_notes')
      .select('*')
      .eq('student_id', studentId)

    if (error) return []
    return data.map((n) => ({
      id: n.id,
      eventId: n.event_id,
      classId: n.class_id,
      studentId: n.student_id,
      teacherId: n.teacher_id,
      content: n.content,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }))
  },

  save: async (
    data: Omit<ClassNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<ClassNote> => {
    // Upsert based on event_id (one note per event per student generally, but schema PK is id)
    // Logic: if note exists for this event+student, update it.
    const { data: existing } = await supabase
      .from('class_notes')
      .select('id')
      .eq('event_id', data.eventId)
      .eq('student_id', data.studentId)
      .single()

    const payload = {
      event_id: data.eventId,
      class_id: data.classId,
      student_id: data.studentId,
      teacher_id: data.teacherId,
      content: data.content,
      updated_at: new Date().toISOString(),
    }

    let result
    if (existing) {
      result = await supabase
        .from('class_notes')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('class_notes')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) throw result.error
    const n = result.data

    return {
      id: n.id,
      eventId: n.event_id,
      classId: n.class_id,
      studentId: n.student_id,
      teacherId: n.teacher_id,
      content: n.content,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }
  },

  delete: async (id: string): Promise<void> => {
    await supabase.from('class_notes').delete().eq('id', id)
  },
}
