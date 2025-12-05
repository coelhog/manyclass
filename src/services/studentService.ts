import { Student, Payment } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    // RLS will filter this to only show students relevant to the current user
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
      status: 'active',
      avatar: p.avatar || '',
      level: 'A1',
      joinedAt: p.created_at,
    }))
  },

  getByTeacherId: async (teacherId: string): Promise<Student[]> => {
    // RLS handles filtering, teacherId param is largely redundant for security but good for explicit intent if using admin API
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
    student: Omit<Student, 'id'> & { password?: string; teacherId?: string },
  ): Promise<Student> => {
    // Get current user ID to set as created_by if not explicitly provided
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: student.email,
        password: student.password,
        name: student.name,
        role: 'student',
        phone: student.phone,
        user_metadata: {
          avatar_url: student.avatar,
          created_by: student.teacherId || currentUser?.id,
        },
      },
    })

    if (error) throw new Error(error.message || 'Failed to create user')
    if (data.error) throw new Error(data.error)

    const newUser = data.user || data // Handle both wrapper and direct user object

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
    studentsData: (Omit<Student, 'id'> & {
      password?: string
      teacherId?: string
    })[],
  ): Promise<Student[]> => {
    const createdStudents: Student[] = []

    for (const s of studentsData) {
      try {
        const created = await studentService.create(s)
        createdStudents.push(created)
      } catch (err) {
        console.error(`Failed to create student ${s.email}:`, err)
        // Continue creating others
      }
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
    await supabase.from('profiles').delete().eq('id', id)
  },

  // Payments
  getAllPayments: async (): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles:student_id(name)')
      .order('created_at', { ascending: false })

    if (error) return []

    return data.map((p: any) => ({
      id: p.id,
      studentId: p.student_id,
      student: p.profiles?.name || 'Unknown',
      amount: p.amount,
      description: p.description,
      status: p.status,
      dueDate: p.due_date,
      createdAt: p.created_at,
    }))
  },

  createPayment: async (
    payment: Omit<Payment, 'id' | 'student'>,
  ): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        student_id: payment.studentId,
        amount: payment.amount,
        description: payment.description,
        status: payment.status,
        due_date: payment.dueDate,
      })
      .select('*, profiles:student_id(name)')
      .single()

    if (error) throw error

    return {
      id: data.id,
      studentId: data.student_id,
      student: data.profiles?.name || 'Unknown',
      amount: data.amount,
      description: data.description,
      status: data.status,
      dueDate: data.due_date,
      createdAt: data.created_at,
    }
  },

  // Stub for subscriptions
  getSubscriptionByStudentId: async (id: string) => undefined,
}
