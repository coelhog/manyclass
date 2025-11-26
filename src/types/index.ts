export type Role = 'teacher' | 'student' | 'admin'

export type PlanType = 'basic' | 'intermediate' | 'premium'

export type SubscriptionStatus = 'active' | 'pending' | 'past_due' | 'expired'

export type BillingCycle = 'monthly' | 'quarterly'

export type BillingModel = 'per_student' | 'per_class'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar: string
  plan_id?: PlanType // Only for teachers
  stripeCustomerId?: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  avatar: string
  level: string
  joinedAt: string
  subscriptionId?: string
}

export interface Subscription {
  id: string
  studentId?: string // If per_student
  classId?: string // If per_class
  plan: 'student_monthly' | 'student_quarterly'
  status: SubscriptionStatus
  startDate: string
  nextBillingDate: string
  amount: number
}

export interface ClassGroup {
  id: string
  name: string
  schedule: string
  status: 'active' | 'archived'
  studentIds: string[]
  billingModel: BillingModel
  price: number
}

export type TaskType = 'text' | 'multiple-choice' | 'file-upload'

export interface TaskOption {
  id: string
  text: string
}

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  classId: string
  dueDate: string
  options?: TaskOption[] // For multiple choice
  status: 'open' | 'closed'
}

export interface TaskSubmission {
  id: string
  taskId: string
  studentId: string
  content?: string // Text answer or file URL
  selectedOptionId?: string // For multiple choice
  submittedAt: string
  grade?: number
  feedback?: string
  status: 'pending' | 'graded'
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  type: 'class' | 'task' | 'test'
  student_ids: string[]
  color?: string
}

export interface CreateEventDTO {
  title: string
  description?: string
  start_time: string
  end_time: string
  type: 'class' | 'task' | 'test'
  student_ids: string[]
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string
}

export interface Payment {
  id: string
  student: string
  description: string
  amount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
}
