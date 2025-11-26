import {
  ClassGroup,
  CalendarEvent,
  CreateEventDTO,
  UpdateEventDTO,
} from '@/types'
import { mockClasses } from '@/lib/mock-data'
import { studentService } from './studentService'

const CLASSES_KEY = 'smartclass_classes'
const EVENTS_KEY = 'smartclass_events'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const classService = {
  // Classes Management
  getAllClasses: async (): Promise<ClassGroup[]> => {
    await delay(500)
    try {
      const stored = localStorage.getItem(CLASSES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : mockClasses
      }
    } catch (e) {
      console.error('Error loading classes', e)
    }
    localStorage.setItem(CLASSES_KEY, JSON.stringify(mockClasses))
    return mockClasses
  },

  getClassById: async (id: string): Promise<ClassGroup | undefined> => {
    const classes = await classService.getAllClasses()
    return classes.find((c) => c.id === id)
  },

  createClass: async (data: Omit<ClassGroup, 'id'>): Promise<ClassGroup> => {
    await delay(500)
    const classes = await classService.getAllClasses()
    const newClass = { ...data, id: Math.random().toString(36).substr(2, 9) }
    const updated = [...classes, newClass]
    localStorage.setItem(CLASSES_KEY, JSON.stringify(updated))

    // Auto-generate subscriptions logic
    if (newClass.billingModel === 'per_class') {
      console.log('Generated class subscription for', newClass.name)
    } else if (newClass.billingModel === 'per_student') {
      if (newClass.studentIds.length > 0) {
        for (const studentId of newClass.studentIds) {
          await studentService.createSubscription({
            studentId,
            plan: 'student_monthly',
            status: 'pending',
            startDate: new Date().toISOString(),
            nextBillingDate: new Date().toISOString(),
            amount: newClass.price,
          })
        }
      }
    }

    return newClass
  },

  updateClass: async (
    id: string,
    data: Partial<ClassGroup>,
  ): Promise<ClassGroup> => {
    await delay(300)
    const classes = await classService.getAllClasses()
    const index = classes.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Class not found')

    // Check if new students were added to generate subscriptions
    const oldStudentIds = classes[index].studentIds
    const newStudentIds = data.studentIds || []

    const addedStudents = newStudentIds.filter(
      (id) => !oldStudentIds.includes(id),
    )

    if (
      addedStudents.length > 0 &&
      classes[index].billingModel === 'per_student'
    ) {
      for (const studentId of addedStudents) {
        await studentService.createSubscription({
          studentId,
          plan: 'student_monthly',
          status: 'pending',
          startDate: new Date().toISOString(),
          nextBillingDate: new Date().toISOString(),
          amount: classes[index].price,
        })
      }
    }

    const updated = { ...classes[index], ...data }
    classes[index] = updated
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes))
    return updated
  },

  // Events Management
  getEvents: async (): Promise<CalendarEvent[]> => {
    await delay(300)
    try {
      const stored = localStorage.getItem(EVENTS_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Error loading events', e)
    }
    return []
  },

  createEvent: async (data: CreateEventDTO): Promise<CalendarEvent> => {
    await delay(300)
    const events = await classService.getEvents()
    const newEvent: CalendarEvent = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      color: 'bg-primary/20 border-primary/30 text-primary-foreground',
    }
    const updated = [...events, newEvent]
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updated))
    return newEvent
  },

  updateEvent: async (data: UpdateEventDTO): Promise<CalendarEvent> => {
    await delay(300)
    const events = await classService.getEvents()
    const index = events.findIndex((e) => e.id === data.id)
    if (index === -1) throw new Error('Event not found')
    const updated = { ...events[index], ...data }
    events[index] = updated
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
    return updated
  },

  deleteEvent: async (id: string): Promise<void> => {
    await delay(300)
    const events = await classService.getEvents()
    const filtered = events.filter((e) => e.id !== id)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered))
  },
}
