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
    // In Supabase, students are linked to teachers via Classes or specific tables
    // For this implementation, we'll fetch students that belong to any class of the teacher
    // Or simplistic view: all students
    // To make it robust, let's query students enrolled in teacher's classes
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
    // Use Supabase Admin API or standard SignUp
    // Since this is client side, we use signUp
    // Note: This logs the current user out in standard Supabase flow if used directly
    // But typically teachers create accounts. We can use a secondary client or Edge Function for this.
    // For this implementation, we'll rely on the existing AuthContext mechanism logic or just insert to profile if user exists?
    // No, must create Auth User.
    // We will call the signUp endpoint. If we are logged in, we might get logged out.
    // BEST PRACTICE: Use an Edge Function to create users without logging out admin/teacher.
    // FOR THIS DEMO: We assume an Edge Function exists or we'll simulate by just creating the profile
    // BUT profile depends on auth.id.
    // Solution: We'll instruct user this creates an account.
    // Actually, let's assume we can just invite them?
    // We will implement a "Invite" logic mock by creating profile if possible or fail.
    // Ideally, we should call `supabase.auth.signUp` but that requires session handling.
    // Given instructions, I'll implement assuming we are creating a user via a mock or allowed process.
    // Real implementation: use Edge Function.
    // Fallback here: Just return mock/error if we can't create auth user from client safely without logout.
    // ACTUALLY, `supabase.auth.signUp` does NOT log out current user if autoConfirm is off? No.
    // Let's try to just insert into profiles if we assume pre-created auth? No.
    // I'll implement a "best effort" using a separate client instance if needed or just warning.
    // We will assume the user knows this limitation or we use a backend proxy.
    throw new Error(
      'Criação de usuário requer Função Edge (Admin) para não desconectar o professor.',
    )
  },

  createBulk: async (
    studentsData: (Omit<Student, 'id'> & { password?: string })[],
  ): Promise<Student[]> => {
    throw new Error('Bulk create requires Admin API')
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
    await supabase.from('profiles').delete().eq('id', id)
  },

  // Subscriptions (Mocked for now as tables not fully defined for billing)
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
