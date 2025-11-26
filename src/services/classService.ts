import { CalendarEvent, CreateEventDTO, UpdateEventDTO } from '@/types'
import { mockStudents } from '@/lib/mock-data'

// Mock initial data
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Inglês Iniciante A1',
    description: 'Aula de gramática básica',
    start_time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    type: 'class',
    student_ids: ['1', '2'],
    color: 'bg-blue-100 border-blue-200 text-blue-700',
  },
  {
    id: '2',
    title: 'Prova de Espanhol',
    description: 'Avaliação mensal',
    start_time: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    type: 'test',
    student_ids: ['2'],
    color: 'bg-red-100 border-red-200 text-red-700',
  },
  {
    id: '3',
    title: 'Entrega de Redação',
    description: 'Tema: Minhas Férias',
    start_time: new Date(
      new Date().setDate(new Date().getDate() + 1),
    ).toISOString(),
    end_time: new Date(
      new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
        12,
        0,
        0,
        0,
      ),
    ).toISOString(),
    type: 'task',
    student_ids: ['1', '3'],
    color: 'bg-yellow-100 border-yellow-200 text-yellow-700',
  },
]

const STORAGE_KEY = 'smartclass_events'

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const classService = {
  getEvents: async (): Promise<CalendarEvent[]> => {
    await delay(800) // Simulate network latency
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS))
    return INITIAL_EVENTS
  },

  createEvent: async (data: CreateEventDTO): Promise<CalendarEvent> => {
    await delay(500)
    const events = await classService.getEvents()
    const newEvent: CalendarEvent = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      color: getColorForType(data.type),
    }
    const updatedEvents = [...events, newEvent]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents))

    // Mock Supabase Call
    console.log('[Supabase Mock] Inserted into lessons table:', newEvent)

    return newEvent
  },

  updateEvent: async (data: UpdateEventDTO): Promise<CalendarEvent> => {
    await delay(300)
    const events = await classService.getEvents()
    const index = events.findIndex((e) => e.id === data.id)
    if (index === -1) throw new Error('Event not found')

    const updatedEvent = { ...events[index], ...data }
    if (data.type) {
      updatedEvent.color = getColorForType(data.type)
    }

    events[index] = updatedEvent
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))

    // Mock Supabase Call
    console.log('[Supabase Mock] Updated lessons table:', updatedEvent)

    return updatedEvent
  },

  deleteEvent: async (id: string): Promise<void> => {
    await delay(300)
    const events = await classService.getEvents()
    const filteredEvents = events.filter((e) => e.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents))

    // Mock Supabase Call
    console.log('[Supabase Mock] Deleted from lessons table:', id)
  },
}

function getColorForType(type: string): string {
  switch (type) {
    case 'class':
      return 'bg-primary/20 border-primary/30 text-primary-foreground'
    case 'test':
      return 'bg-destructive/20 border-destructive/30 text-destructive-foreground'
    case 'task':
      return 'bg-orange-100 border-orange-200 text-orange-800'
    default:
      return 'bg-muted border-muted-foreground/20 text-muted-foreground'
  }
}
