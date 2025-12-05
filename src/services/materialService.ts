import { Material } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const materialService = {
  getAll: async (): Promise<Material[]> => {
    const { data, error } = await supabase
      .from('materials')
      .select('*, material_access(student_id)')

    if (error || !data) return []

    // Since bucket is private, we must generate signed URLs for access
    return await Promise.all(
      data.map(async (m) => {
        // Extract path from file_url or construct it
        // Assuming file_url stores just the path (teacherId/filename) in new version,
        // OR full url. We try to extract path.
        let path = m.file_url || ''

        // Basic check if it looks like a full URL or a path
        if (path.startsWith('http')) {
          const urlParts = path.split('/materials/')
          if (urlParts.length > 1) {
            path = urlParts[1]
          }
        }

        let signedUrl = m.file_url // Default fall back
        if (path) {
          const { data: signedData } = await supabase.storage
            .from('materials')
            .createSignedUrl(path, 3600) // 1 hour expiry
          if (signedData) {
            signedUrl = signedData.signedUrl
          }
        }

        return {
          id: m.id,
          teacherId: m.teacher_id,
          title: m.title,
          description: m.description,
          fileUrl: signedUrl,
          fileType: m.file_type,
          uploadedAt: m.uploaded_at,
          studentIds: m.material_access.map((ma: any) => ma.student_id),
        }
      }),
    )
  },

  create: async (
    material: Omit<Material, 'id' | 'uploadedAt' | 'fileUrl'> & {
      file?: File
      fileUrl?: string
    },
  ): Promise<Material> => {
    let filePath = material.fileUrl || ''

    // Handle File Upload if provided
    if (material.file) {
      const fileExt = material.file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      filePath = `${material.teacherId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, material.file)

      if (uploadError) throw uploadError
    }

    // We store the filePath in file_url column for RLS enabled buckets
    // so we can sign it later
    const { data: m, error } = await supabase
      .from('materials')
      .insert({
        teacher_id: material.teacherId,
        title: material.title,
        description: material.description,
        file_url: filePath,
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

    // Generate immediate signed URL for return
    let signedUrl = filePath
    if (material.file) {
      const { data: signedData } = await supabase.storage
        .from('materials')
        .createSignedUrl(filePath, 3600)
      if (signedData) signedUrl = signedData.signedUrl
    }

    return {
      id: m.id,
      teacherId: m.teacher_id,
      title: m.title,
      description: m.description,
      fileUrl: signedUrl,
      fileType: m.file_type,
      uploadedAt: m.uploaded_at,
      studentIds: material.studentIds,
    }
  },

  update: async (id: string, data: Partial<Material>): Promise<Material> => {
    if (data.studentIds) {
      await supabase.from('material_access').delete().eq('material_id', id)
      if (data.studentIds.length > 0) {
        await supabase.from('material_access').insert(
          data.studentIds.map((sid) => ({
            material_id: id,
            student_id: sid,
          })),
        )
      }
    }

    // Note: currently we just refresh getAll which handles signing
    const updated = await materialService.getAll()
    return updated.find((m) => m.id === id)!
  },

  delete: async (id: string): Promise<void> => {
    // Get path first to delete file
    const { data: m } = await supabase
      .from('materials')
      .select('file_url')
      .eq('id', id)
      .single()

    if (m?.file_url) {
      // Try to delete from storage if it looks like a path
      await supabase.storage.from('materials').remove([m.file_url])
    }

    await supabase.from('materials').delete().eq('id', id)
  },

  getByStudentId: async (studentId: string): Promise<Material[]> => {
    const { data, error } = await supabase
      .from('material_access')
      .select('material_id, materials(*)')
      .eq('student_id', studentId)

    if (error || !data) return []

    return await Promise.all(
      data.map(async (d: any) => {
        let path = d.materials.file_url || ''
        if (path.startsWith('http')) {
          const urlParts = path.split('/materials/')
          if (urlParts.length > 1) {
            path = urlParts[1]
          }
        }

        let signedUrl = d.materials.file_url
        if (path) {
          const { data: signedData } = await supabase.storage
            .from('materials')
            .createSignedUrl(path, 3600)
          if (signedData) {
            signedUrl = signedData.signedUrl
          }
        }

        return {
          id: d.materials.id,
          teacherId: d.materials.teacher_id,
          title: d.materials.title,
          description: d.materials.description,
          fileUrl: signedUrl,
          fileType: d.materials.file_type,
          uploadedAt: d.materials.uploaded_at,
          studentIds: [studentId],
        }
      }),
    )
  },

  getByTeacherId: async (teacherId: string): Promise<Material[]> => {
    return materialService.getAll() // RLS handles filtering for teacher too
  },
}
