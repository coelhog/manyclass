import { TeacherSchedule, TimeSlot } from '@/types'
import { classService } from './classService'
import { db } from '@/lib/db'
import { addMinutes, parse, isSameDay, format } from 'date-fns'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_SCHEDULE = 'schedule'

const defaultSchedule: TeacherSchedule = {
  id: 'default',
  teacherId: '1',
  bookingDuration: 60,
  bookingLinkEnabled: true,
  availability: [],
}

export const scheduleService = {
  getSchedule: async (): Promise<TeacherSchedule> => {
    await delay(500)
    const schedules = db.get<TeacherSchedule>(COLLECTION_SCHEDULE)
    if (schedules.length > 0) return schedules[0]

    // Init default
    db.insert(COLLECTION_SCHEDULE, defaultSchedule)
    return defaultSchedule
  },

  updateSchedule: async (
    schedule: TeacherSchedule,
  ): Promise<TeacherSchedule> => {
    await delay(500)
    return db.update(COLLECTION_SCHEDULE, schedule.id, schedule)
  },

  updateAvailability: async (
    availability: TimeSlot[],
  ): Promise<TeacherSchedule> => {
    const schedule = await scheduleService.getSchedule()
    return scheduleService.updateSchedule({ ...schedule, availability })
  },

  getAvailableSlotsForDate: async (date: Date): Promise<string[]> => {
    const schedule = await scheduleService.getSchedule()
    const events = await classService.getEvents()

    const dayOfWeek = date.getDay()
    const daySlots = schedule.availability.filter(
      (s) => s.dayOfWeek === dayOfWeek,
    )

    if (daySlots.length === 0) return []

    const availableTimes: string[] = []
    const duration = schedule.bookingDuration || 60

    daySlots.forEach((slot) => {
      let current = parse(slot.startTime, 'HH:mm', date)
      const end = parse(slot.endTime, 'HH:mm', date)

      while (addMinutes(current, duration) <= end) {
        const slotStart = current
        const slotEnd = addMinutes(current, duration)

        const hasCollision = events.some((event) => {
          const eventStart = new Date(event.start_time)
          const eventEnd = new Date(event.end_time)

          if (!isSameDay(eventStart, date)) return false

          return slotStart < eventEnd && slotEnd > eventStart
        })

        if (!hasCollision) {
          availableTimes.push(format(slotStart, 'HH:mm'))
        }

        current = addMinutes(current, duration)
      }
    })

    return availableTimes.sort()
  },
}
