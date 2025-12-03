export type Role = 'admin' | 'teacher' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  plan_id?: PlanType | null
  phone?: string
  bio?: string
  onboardingCompleted?: boolean
}

export type PlanType = 'basic' | 'intermediate' | 'premium'

export interface Plan {
  id: PlanType
  name: string
  priceMonthly: number
  priceAnnual: number
  description: string
  features: string[]
  highlight?: boolean
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'archived'
  avatar: string
  level: string
  joinedAt: string
  teacherId?: string
}

export type ClassStatus = 'active' | 'archived' | 'completed'
export type BillingModel = 'per_student' | 'per_class'
export type ClassCategory = 'individual' | 'group' | 'class'

export interface ClassGroup {
  id: string
  teacherId: string
  name: string
  schedule: string
  days: number[]
  startTime: string
  duration: number
  status: ClassStatus
  billingModel: BillingModel
  price: number
  category: ClassCategory
  studentLimit?: number
  meetLink?: string
  color: string
  studentIds: string[]
  customStudentPrices?: Record<string, number>
}

export type TaskType = 'text' | 'multiple-choice' | 'file-upload'
export type TaskStatus = 'open' | 'in_progress' | 'closed' | string

export interface TaskOption {
  id: string
  text: string
}

export interface TaskTag {
  id: string
  label: string
  color: string
}

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  classId?: string
  studentId?: string
  teacherId?: string
  dueDate?: string
  status: TaskStatus
  color?: string
  tags?: TaskTag[]
  options?: TaskOption[]
}

export interface TaskSubmission {
  id: string
  taskId: string
  studentId: string
  content?: string
  selectedOptionId?: string
  submittedAt: string
  grade?: number
  feedback?: string
  status: 'pending' | 'graded'
}

export interface TaskColumn {
  id: string
  title: string
  order: number
}

export interface Material {
  id: string
  teacherId?: string
  title: string
  description?: string
  fileUrl: string
  fileType: string
  uploadedAt: string
  studentIds: string[]
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Payment {
  id: string
  studentId: string
  student?: string // joined name
  amount: number
  description?: string
  status: PaymentStatus
  dueDate: string
  paidAt?: string
  createdAt?: string
}

export interface Subscription {
  id: string
  userId: string
  planId: PlanType
  status: 'active' | 'past_due' | 'canceled' | 'expired'
  currentPeriodEnd: string
  nextBillingDate: string
}

export type IntegrationProvider =
  | 'google_calendar'
  | 'google_meet'
  | 'zoom'
  | 'asaas'

export interface IntegrationConfig {
  apiKey?: string
  webhookUrl?: string
  accessToken?: string
  refreshToken?: string
  syncToPersonalCalendar?: boolean
  [key: string]: any
}

export interface Integration {
  id: string
  integration_id: string // provider id like 'google_calendar'
  name: string
  provider: IntegrationProvider
  type: 'oauth' | 'api_key'
  logo: string
  description: string
  status: 'connected' | 'disconnected'
  config?: IntegrationConfig
  connectedAt?: string
  planRequired?: PlanType
}

export interface OnboardingQuestion {
  id: string
  step: number
  text: string
  type: 'text' | 'choice' | 'multi-choice'
  options?: string[]
}

export interface OnboardingResponse {
  id: string
  userId: string
  questionId: string
  answer: string
  answeredAt: string
}

export interface AutomatedMessage {
  id: string
  title: string
  type: 'class_reminder' | 'payment_reminder' | 're_engagement'
  template: string
  isActive: boolean
  timing: string
}

export type EventType = 'class' | 'task' | 'test' | 'reminder'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  type: EventType
  student_ids: string[]
  color?: string
  classId?: string // link back to class if auto-generated
  link?: string
  isSynced?: boolean
}

export interface CreateEventDTO extends Omit<CalendarEvent, 'id'> {}
export interface UpdateEventDTO extends Partial<CalendarEvent> {
  id: string
}

export interface ClassNote {
  id: string
  eventId?: string
  classId?: string
  studentId: string
  teacherId?: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface PlatformCourse {
  id: string
  title: string
  description: string
  videoUrl: string
  isActive: boolean
  createdAt: string
}

export interface TimeSlot {
  dayOfWeek: number // 0-6
  startTime: string // HH:mm
  endTime: string // HH:mm
  planIds?: string[] // which plans can book this slot
}

export interface TeacherSchedule {
  id: string
  teacherId: string
  availability: TimeSlot[]
  bookingDuration: number // minutes
  bookingLinkEnabled: boolean
}
