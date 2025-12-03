import {
  ClassGroup,
  CalendarEvent,
  CreateEventDTO,
  UpdateEventDTO,
  Subscription,
} from '@/types'
import { db } from '@/lib/db'
import { studentService } from './studentService'
import { taskService } from './taskService'
import { integrationService } from './integrationService'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addMinutes,
  isWithinInterval,
  parseISO,
} from 'date-fns'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_CLASSES = 'classes'
const COLLECTION_EVENTS = 'events'
const DAYS_MAP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const classService = {
  // Classes Management
  getAllClasses: async (): Promise<ClassGroup[]> => {
    await delay(500)
    return db.get<ClassGroup>(COLLECTION_CLASSES)
  },

  getByTeacherId: async (teacherId: string): Promise<ClassGroup[]> => {
    await delay(300)
    const classes = db.get<ClassGroup>(COLLECTION_CLASSES)
    return classes.filter((c) => c.teacherId === teacherId)
  },

  getClassById: async (id: string): Promise<ClassGroup | undefined> => {
    return db.getById<ClassGroup>(COLLECTION_CLASSES, id)
  },

  createClass: async (data: Omit<ClassGroup, 'id'>): Promise<ClassGroup> => {
    await delay(500)

    // Google Meet Integration
    let meetLink = undefined
    const isMeetConnected = await integrationService.isConnected('google_meet')
    if (isMeetConnected) {
      // Mock generating a meet link
      meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`
    }

    const newClass = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      meetLink,
    }
    db.insert(COLLECTION_CLASSES, newClass)

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
    const cls = db.getById<ClassGroup>(COLLECTION_CLASSES, id)
    if (!cls) throw new Error('Class not found')

    // Check if Google Meet is connected and link is missing
    const isMeetConnected = await integrationService.isConnected('google_meet')
    let meetLink = cls.meetLink
    if (isMeetConnected && !meetLink) {
      meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`
    }

    // Check if new students were added to generate subscriptions
    const oldStudentIds = cls.studentIds
    const newStudentIds = data.studentIds || []

    const addedStudents = newStudentIds.filter(
      (sid) => !oldStudentIds.includes(sid),
    )

    if (addedStudents.length > 0 && cls.billingModel === 'per_student') {
      for (const studentId of addedStudents) {
        // Check for custom price override
        const price = cls.customStudentPrices?.[studentId] ?? cls.price

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

    let updated = { ...cls, ...data, meetLink }

    // Update schedule string if days/time changed
    if (data.days || data.startTime) {
      const daysStr = updated.days.map((d) => DAYS_MAP[d]).join('/')
      updated.schedule = `${daysStr} ${updated.startTime}`
    }

    return db.update(COLLECTION_CLASSES, id, updated)
  },

  updateStudentPrice: async (
    classId: string,
    studentId: string,
    price: number,
  ): Promise<void> => {
    const cls = db.getById<ClassGroup>(COLLECTION_CLASSES, classId)
    if (!cls) throw new Error('Class not found')

    const customPrices = cls.customStudentPrices || {}
    customPrices[studentId] = price

    db.update(COLLECTION_CLASSES, classId, {
      customStudentPrices: customPrices,
    })
  },

  // Events Management
  getEvents: async (): Promise<CalendarEvent[]> => {
    await delay(300)
    try {
      const events = db.get<CalendarEvent>(COLLECTION_EVENTS)

      // 1. Fetch tasks with due dates and convert to events
      const tasks = await taskService.getAllTasks()
      const taskEvents: CalendarEvent[] = tasks
        .filter((t) => t.dueDate)
        .map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          start_time: t.dueDate!,
          end_time: t.dueDate!,
          type: 'task',
          student_ids: t.studentId ? [t.studentId] : [],
          color: t.color || 'blue',
        }))

      // 2. Generate Class Events automatically
      const classes = await classService.getAllClasses()

      // Check Integration Status for Calendar Sync
      const calendarIntegration =
        await integrationService.getByProvider('google_calendar')
      const isCalendarConnected = calendarIntegration?.status === 'connected'
      const shouldSyncToPersonal =
        calendarIntegration?.config?.syncToPersonalCalendar ?? false

      const classEvents: CalendarEvent[] = []

      const today = new Date()
      const start = startOfMonth(subMonths(today, 1))
      const end = endOfMonth(addMonths(today, 1))
      const interval = eachDayOfInterval({ start, end })

      const allSubscriptions = db.get<Subscription>('subscriptions')

      classes.forEach((cls) => {
        if (cls.status !== 'active') return

        interval.forEach((day) => {
          if (cls.days.includes(day.getDay())) {
            const [hours, minutes] = cls.startTime.split(':').map(Number)
            const startTime = new Date(day)
            startTime.setHours(hours, minutes, 0, 0)
            const endTime = addMinutes(startTime, cls.duration || 60)

            // Filter students based on their subscription period
            const activeStudentIds = cls.studentIds.filter((studentId) => {
              if (cls.billingModel !== 'per_student') return true

              const sub = allSubscriptions.find(
                (s) => s.studentId === studentId,
              )
              if (!sub) return false

              const subStart = parseISO(sub.startDate)
              const subEnd = parseISO(sub.nextBillingDate)

              if (sub.status === 'expired' || sub.status === 'past_due') {
                return isWithinInterval(startTime, {
                  start: subStart,
                  end: subEnd,
                })
              }

              return sub.status === 'active' || sub.status === 'pending'
            })

            if (activeStudentIds.length > 0) {
              classEvents.push({
                id: `auto-${cls.id}-${day.toISOString()}`,
                title: cls.name,
                description: `Aula de ${cls.name}. ${cls.meetLink ? `Link: ${cls.meetLink}` : ''}`,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                type: 'class',
                student_ids: activeStudentIds,
                color: cls.color || 'green',
                classId: cls.id,
                link: cls.meetLink,
                isSynced: isCalendarConnected && shouldSyncToPersonal,
              })
            }
          }
        })
      })

      return [...events, ...taskEvents, ...classEvents]
    } catch (e) {
      console.error('Error loading events', e)
      return []
    }
  },

  createEvent: async (data: CreateEventDTO): Promise<CalendarEvent> => {
    await delay(300)

    const calendarIntegration =
      await integrationService.getByProvider('google_calendar')
    const isCalendarConnected = calendarIntegration?.status === 'connected'
    const shouldSyncToPersonal =
      calendarIntegration?.config?.syncToPersonalCalendar ?? false

    const newEvent: CalendarEvent = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      color: data.color || 'blue',
      isSynced: isCalendarConnected && shouldSyncToPersonal,
    }

    return db.insert(COLLECTION_EVENTS, newEvent)
  },

  updateEvent: async (data: UpdateEventDTO): Promise<CalendarEvent> => {
    await delay(300)
    return db.update(COLLECTION_EVENTS, data.id, data)
  },

  deleteEvent: async (id: string): Promise<void> => {
    await delay(300)
    db.delete(COLLECTION_EVENTS, id)
  },
}
