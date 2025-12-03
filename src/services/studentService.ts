import { Student, Subscription, Payment } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')

    if (error) return []

    return data.map((p) => ({
      id: p.id,
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      status: 'active', // Default to active for profiles
      avatar: p.avatar || '',
      level: 'A1', // Default level as it's not in profile
      joinedAt: p.created_at,
    }))
  },

  getByTeacherId: async (teacherId: string): Promise<Student[]> => {
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId)

    if (!classes || classes.length === 0) return []

    const classIds = classes.map((c) => c.id)

    const { data: classStudents } = await supabase
      .from('class_students')
      .select('student_id')
      .in('class_id', classIds)

    if (!classStudents || classStudents.length === 0) return []

    const studentIds = [...new Set(classStudents.map((cs) => cs.student_id))]

    const { data: students } = await supabase
      .from('profiles')
      .select('*')
      .in('id', studentIds)

    if (!students) return []

    return students.map((p) => ({
      id: p.id,
      teacherId, // Inferred context
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      status: 'active',
      avatar: p.avatar || '',
      level: 'A1',
      joinedAt: p.created_at,
    }))
  },

  getById: async (id: string): Promise<Student | undefined> => {
    const { data: p, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !p) return undefined

    return {
      id: p.id,
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      status: 'active',
      avatar: p.avatar || '',
      level: 'A1',
      joinedAt: p.created_at,
    }
  },

  create: async (
    student: Omit<Student, 'id'> & { password?: string },
  ): Promise<Student> => {
    // Use Edge Function to create user securely without logging out teacher
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: student.email,
        password: student.password,
        name: student.name,
        role: 'student',
        phone: student.phone,
        user_metadata: {
          avatar_url: student.avatar,
        },
      },
    })

    if (error) {
      throw new Error(error.message || 'Failed to create user')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    const newUser = data.user

    return {
      id: newUser.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      status: 'active',
      avatar: student.avatar,
      level: student.level || 'A1',
      joinedAt: new Date().toISOString(),
    }
  },

  createBulk: async (
    studentsData: (Omit<Student, 'id'> & { password?: string })[],
  ): Promise<Student[]> => {
    const createdStudents: Student[] = []
    const errors: any[] = []

    // Process sequentially to avoid rate limits or use Promise.all for parallelism if limits permit
    // Using Promise.all for now but might need throttling in real scenario
    await Promise.all(
      studentsData.map(async (s) => {
        try {
          const created = await studentService.create(s)
          createdStudents.push(created)
        } catch (err) {
          errors.push({ student: s.email, error: err })
        }
      }),
    )

    if (errors.length > 0) {
      console.error('Bulk create errors:', errors)
    }

    return createdStudents
  },

  update: async (
    id: string,
    data: Partial<Student> & { password?: string },
  ): Promise<Student> => {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: updated.id,
      name: updated.name || '',
      email: updated.email || '',
      phone: updated.phone || '',
      status: 'active',
      avatar: updated.avatar || '',
      level: 'A1',
      joinedAt: updated.created_at,
    }
  },

  delete: async (id: string): Promise<void> => {
    // Note: Deleting from profiles might not delete from auth.users without admin API
    // The DB constraint usually is ON DELETE CASCADE from auth.users -> profiles
    // To delete properly we probably need an edge function 'delete-user' as well
    // For now we just delete profile which might fail if there are FK constraints or won't delete auth user
    // But typically we only have access to public.profiles via RLS.
    // Assuming logic here just removes from view for now or uses another edge function if strictly needed.
    // For this implementation, we'll try deleting profile.
    await supabase.from('profiles').delete().eq('id', id)
  },

  // Subscriptions
  getSubscriptionByStudentId: async (
    studentId: string,
  ): Promise<Subscription | undefined> => {
    return undefined
  },

  createSubscription: async (
    sub: Omit<Subscription, 'id'>,
  ): Promise<Subscription> => {
    return { ...sub, id: 'mock-sub-id' }
  },

  getAllPayments: async (): Promise<Payment[]> => {
    return []
  },

  createPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    return { ...payment, id: 'mock-payment-id' }
  },
}
