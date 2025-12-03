import {
  User,
  Student,
  ClassGroup,
  Task,
  TaskSubmission,
  Payment,
  Subscription,
} from '@/types'

// Exporting empty arrays/defaults to ensure type compatibility
// but removing pre-filled data to enforce clean slate initialization.

export const mockUser: User = {
  id: '1',
  name: 'Default User',
  email: 'user@example.com',
  role: 'teacher',
  avatar: '',
  plan_id: 'basic',
}

export const mockStudentUser: User = {
  id: '2',
  name: 'Default Student',
  email: 'student@example.com',
  role: 'student',
  avatar: '',
}

export const mockAdminUser: User = {
  id: 'admin1',
  name: 'Administrador',
  email: 'admin@smartclass.com',
  role: 'admin',
  avatar: 'https://img.usecurling.com/i?q=shield&color=blue',
}

export const mockSubscriptions: Subscription[] = []
export const mockStudents: Student[] = []
export const mockClasses: ClassGroup[] = []
export const mockTasks: Task[] = []
export const mockSubmissions: TaskSubmission[] = []
export const mockPayments: Payment[] = []
