import { Material } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const materialService = {
  getAll: async (): Promise<Material[]> => {
    const { data, error } = await supabase
      .from('materials')
      .select('*, material_access(student_id)')

    if (error) return []

    return data.map((m) => ({
      id: m.id,
      teacherId: m.teacher_id,
      title: m.title,
      description: m.description,
      fileUrl: m.file_url,
      fileType: m.file_type,
      uploadedAt: m.uploaded_at,
      studentIds: m.material_access.map((ma: any) => ma.student_id),
    }))
  },

  create: async (
    material: Omit<Material, 'id' | 'uploadedAt'>,
  ): Promise<Material> => {
    const { data: m, error } = await supabase
      .from('materials')
      .insert({
        teacher_id: material.teacherId,
        title: material.title,
        description: material.description,
        file_url: material.fileUrl,
        file_type: material.fileType,
      })
      .select()
      .single()

    if (error) throw error

    if (material.studentIds && material.studentIds.length > 0) {
      await supabase.from('material_access').insert(
        material.studentIds.map((sid) => ({
          material_id: m.id,
          student_id: sid,
        })),
      )
    }

    return {
      id: m.id,
      teacherId: m.teacher_id,
      title: m.title,
      description: m.description,
      fileUrl: m.file_url,
      fileType: m.file_type,
      uploadedAt: m.uploaded_at,
      studentIds: material.studentIds,
    }
  },

  update: async (id: string, data: Partial<Material>): Promise<Material> => {
    if (data.studentIds) {
      await supabase.from('material_access').delete().eq('material_id', id)
      await supabase.from('material_access').insert(
        data.studentIds.map((sid) => ({
          material_id: id,
          student_id: sid,
        })),
      )
    }

    // Not updating content fields for simplicity in this method as UI focuses on access
    // Use simpler update for other fields if needed
    const updated = await materialService.getAll()
    return updated.find((m) => m.id === id)!
  },

  delete: async (id: string): Promise<void> => {
    await supabase.from('materials').delete().eq('id', id)
  },

  getByStudentId: async (studentId: string): Promise<Material[]> => {
    // Join via material_access
    const { data, error } = await supabase
      .from('material_access')
      .select('material_id, materials(*)')
      .eq('student_id', studentId)

    if (error) return []

    return data.map((d: any) => ({
      id: d.materials.id,
      teacherId: d.materials.teacher_id,
      title: d.materials.title,
      description: d.materials.description,
      fileUrl: d.materials.file_url,
      fileType: d.materials.file_type,
      uploadedAt: d.materials.uploaded_at,
      studentIds: [studentId], // simplified
    }))
  },

  getByTeacherId: async (teacherId: string): Promise<Material[]> => {
    const { data, error } = await supabase
      .from('materials')
      .select('*, material_access(student_id)')
      .eq('teacher_id', teacherId)

    if (error) return []

    return data.map((m) => ({
      id: m.id,
      teacherId: m.teacher_id,
      title: m.title,
      description: m.description,
      fileUrl: m.file_url,
      fileType: m.file_type,
      uploadedAt: m.uploaded_at,
      studentIds: m.material_access.map((ma: any) => ma.student_id),
    }))
  },
}
