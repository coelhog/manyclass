export type Role = 'teacher' | 'student' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar: string
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
}

export interface ClassGroup {
  id: string
  name: string
  schedule: string
  status: 'active' | 'archived'
  studentIds: string[]
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
