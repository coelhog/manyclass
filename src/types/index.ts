export type Role = 'teacher' | 'student' | 'admin'

export type PlanType = 'basic' | 'intermediate' | 'premium'

export type SubscriptionStatus = 'active' | 'pending' | 'past_due' | 'expired'

export type BillingCycle = 'monthly' | 'quarterly'

export type BillingModel = 'per_student' | 'per_class'

export type ClassCategory = 'individual' | 'group' | 'class'

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
  category: ClassCategory
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
  type: 'class' | 'task' | 'test' | 'meeting'
  student_ids: string[]
  color?: string
}

export interface CreateEventDTO {
  title: string
  description?: string
  start_time: string
  end_time: string
  type: 'class' | 'task' | 'test' | 'meeting'
  student_ids: string[]
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string
}

export interface Payment {
  id: string
  student: string // Name of the student (legacy) or ID
  studentId?: string // ID of the student
  description: string
  amount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
}

export interface Material {
  id: string
  title: string
  description: string
  fileUrl: string
  fileType: string
  uploadedAt: string
  studentIds: string[] // List of students who have access
}

export type MessageType =
  | 'class_reminder'
  | 'payment_reminder'
  | 're_engagement'

export interface AutomatedMessage {
  id: string
  title: string
  type: MessageType
  template: string
  isActive: boolean
  timing: string // e.g., "30_min_before", "7_days_after"
}

export interface TimeSlot {
  dayOfWeek: number // 0-6
  startTime: string // HH:mm
  endTime: string // HH:mm
  planIds: PlanType[] // Plans that can book this slot
}

export interface TeacherSchedule {
  id: string
  teacherId: string
  availability: TimeSlot[]
  bookingDuration?: number // in minutes, default 60
  bookingLinkEnabled?: boolean
}

// Kanban Types
export interface KanbanColumn {
  id: string
  title: string
  order: number
}

export interface KanbanTask {
  id: string
  columnId: string
  title: string
  description?: string
  tags: string[]
  category?: string
  studentId?: string
  order: number
  createdAt: string
}
