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
  phone?: string
  bio?: string
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
  password?: string // Mock password for management
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
  schedule: string // Display string (e.g., "Seg/Qua 19:00")
  days: number[] // 0-6 (Sun-Sat)
  startTime: string // HH:mm
  duration: number // minutes
  status: 'active' | 'archived'
  studentIds: string[]
  billingModel: BillingModel
  price: number
  category: ClassCategory
  studentLimit?: number
  customStudentPrices?: Record<string, number> // studentId -> price
  color?: string
  meetLink?: string // Google Meet Link
}

export type TaskType = 'text' | 'multiple-choice' | 'file-upload'

export interface TaskOption {
  id: string
  text: string
}

export interface TaskTag {
  id: string
  label: string
  color: string // e.g., 'red', 'blue', 'green'
}

export interface TaskColumn {
  id: string
  title: string
  order: number
}

export interface Task {
  id: string
  title: string
  description: string
  type?: TaskType
  classId?: string
  studentId?: string
  dueDate?: string // Optional
  options?: TaskOption[] // For multiple choice
  status: string // Changed to string to support custom columns (columnId)
  tags?: TaskTag[]
  color?: string // Custom color for calendar
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
  classId?: string
  link?: string
  isSynced?: boolean // If synced with Google Calendar
}

export interface CreateEventDTO {
  title: string
  description?: string
  start_time: string
  end_time: string
  type: 'class' | 'task' | 'test' | 'meeting'
  student_ids: string[]
  color?: string
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
  teacherId?: string
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

// Kanban Types (Legacy/Teacher Kanban)
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

// Integration Types
export type IntegrationProvider =
  | 'google_calendar'
  | 'google_meet'
  | 'zoom'
  | 'microsoft_teams'
  | 'asaas'

export interface IntegrationConfig {
  syncToPersonalCalendar?: boolean
  [key: string]: any
}

export interface Integration {
  id: string
  name: string
  provider: IntegrationProvider
  type: 'oauth' | 'api_key'
  status: 'connected' | 'disconnected'
  logo: string
  description: string
  config?: IntegrationConfig
  connectedAt?: string
}

// Notes Types
export interface ClassNote {
  id: string
  eventId: string // Link to the specific class occurrence ID
  classId?: string // Link to the parent ClassGroup
  studentId: string
  teacherId: string
  content: string // HTML content from rich text editor
  createdAt: string
  updatedAt: string
}
