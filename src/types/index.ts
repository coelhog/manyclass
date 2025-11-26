export interface Student {
  id: string
  name: string
  email: string
  avatar: string
}

export type EventType = 'class' | 'task' | 'test'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string // ISO string
  end_time: string // ISO string
  type: EventType
  student_ids: string[]
  color?: string
}

export interface CreateEventDTO {
  title: string
  description?: string
  start_time: string
  end_time: string
  type: EventType
  student_ids: string[]
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string
}
