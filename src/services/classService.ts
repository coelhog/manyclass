import {
  ClassGroup,
  CalendarEvent,
  CreateEventDTO,
  UpdateEventDTO,
} from '@/types'
import { mockClasses } from '@/lib/mock-data'
import { studentService } from './studentService'
import { taskService } from './taskService'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addMinutes,
} from 'date-fns'

const CLASSES_KEY = 'manyclass_classes'
const EVENTS_KEY = 'manyclass_events'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const DAYS_MAP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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
    if (newClass.billingModel === 'per_student') {
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
        // Check for custom price override
        const price =
          classes[index].customStudentPrices?.[studentId] ??
          classes[index].price

        await studentService.createSubscription({
          studentId,
          plan: 'student_monthly',
          status: 'pending',
          startDate: new Date().toISOString(),
          nextBillingDate: new Date().toISOString(),
          amount: price,
        })
      }
    }

    const updated = { ...classes[index], ...data }

    // Update schedule string if days/time changed
    if (data.days || data.startTime) {
      const daysStr = updated.days.map((d) => DAYS_MAP[d]).join('/')
      updated.schedule = `${daysStr} ${updated.startTime}`
    }

    classes[index] = updated
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes))
    return updated
  },

  updateStudentPrice: async (
    classId: string,
    studentId: string,
    price: number,
  ): Promise<void> => {
    const classes = await classService.getAllClasses()
    const index = classes.findIndex((c) => c.id === classId)
    if (index === -1) throw new Error('Class not found')

    const cls = classes[index]
    const customPrices = cls.customStudentPrices || {}
    customPrices[studentId] = price

    const updated = { ...cls, customStudentPrices: customPrices }
    classes[index] = updated
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes))
  },

  // Events Management
  getEvents: async (): Promise<CalendarEvent[]> => {
    await delay(300)
    try {
      let events: CalendarEvent[] = []
      const stored = localStorage.getItem(EVENTS_KEY)
      if (stored) {
        events = JSON.parse(stored)
      }

      // 1. Fetch tasks with due dates and convert to events
      const tasks = await taskService.getAllTasks()
      const taskEvents: CalendarEvent[] = tasks
        .filter((t) => t.dueDate)
        .map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          start_time: t.dueDate!,
          end_time: t.dueDate!, // Tasks are point-in-time
          type: 'task',
          student_ids: t.studentId ? [t.studentId] : [],
          color: t.color || 'blue',
        }))

      // 2. Generate Class Events automatically
      const classes = await classService.getAllClasses()
      const classEvents: CalendarEvent[] = []

      // Generate for current month +/- 1 month
      const today = new Date()
      const start = startOfMonth(subMonths(today, 1))
      const end = endOfMonth(addMonths(today, 1))
      const interval = eachDayOfInterval({ start, end })

      classes.forEach((cls) => {
        if (cls.status !== 'active') return

        interval.forEach((day) => {
          if (cls.days.includes(day.getDay())) {
            const [hours, minutes] = cls.startTime.split(':').map(Number)
            const startTime = new Date(day)
            startTime.setHours(hours, minutes, 0, 0)
            const endTime = addMinutes(startTime, cls.duration || 60)

            classEvents.push({
              id: `auto-${cls.id}-${day.toISOString()}`,
              title: cls.name,
              description: `Aula de ${cls.name}. Link: https://meet.google.com/abc-defg-hij`, // Mock link
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              type: 'class',
              student_ids: cls.studentIds,
              color: cls.color || 'green',
              classId: cls.id,
              link: 'https://meet.google.com/abc-defg-hij',
            })
          }
        })
      })

      const allEvents = [...events, ...taskEvents, ...classEvents]

      // Simulate "Automatic release of calendar slots for group students with overdue payments"
      const payments = await studentService.getAllPayments()
      const overdueStudentIds = payments
        .filter((p) => p.status === 'overdue' && p.studentId)
        .map((p) => p.studentId!)

      const processedEvents = allEvents.map((event) => {
        // If it's a group class (more than 1 student or type class), filter overdue
        if (event.student_ids.length > 1 || event.type === 'class') {
          return {
            ...event,
            student_ids: event.student_ids.filter(
              (sid) => !overdueStudentIds.includes(sid),
            ),
          }
        }
        return event
      })

      return processedEvents
    } catch (e) {
      console.error('Error loading events', e)
    }
    return []
  },

  createEvent: async (data: CreateEventDTO): Promise<CalendarEvent> => {
    await delay(300)
    const stored = localStorage.getItem(EVENTS_KEY)
    const rawEvents: CalendarEvent[] = stored ? JSON.parse(stored) : []

    const newEvent: CalendarEvent = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      color: data.color || 'blue',
    }
    const updated = [...rawEvents, newEvent]
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updated))
    return newEvent
  },

  updateEvent: async (data: UpdateEventDTO): Promise<CalendarEvent> => {
    await delay(300)
    const stored = localStorage.getItem(EVENTS_KEY)
    const rawEvents: CalendarEvent[] = stored ? JSON.parse(stored) : []

    const index = rawEvents.findIndex((e) => e.id === data.id)
    if (index === -1) throw new Error('Event not found')

    const updated = { ...rawEvents[index], ...data }
    rawEvents[index] = updated
    localStorage.setItem(EVENTS_KEY, JSON.stringify(rawEvents))
    return updated
  },

  deleteEvent: async (id: string): Promise<void> => {
    await delay(300)
    const stored = localStorage.getItem(EVENTS_KEY)
    const rawEvents: CalendarEvent[] = stored ? JSON.parse(stored) : []
    const filtered = rawEvents.filter((e) => e.id !== id)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered))
  },
}
