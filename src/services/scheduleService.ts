import { TeacherSchedule, TimeSlot, CalendarEvent } from '@/types'
import { classService } from './classService'
import {
  addMinutes,
  parse,
  isSameDay,
  isWithinInterval,
  format,
} from 'date-fns'

const SCHEDULE_KEY = 'manyclass_schedule'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockSchedule: TeacherSchedule = {
  id: '1',
  teacherId: '1',
  bookingDuration: 60,
  bookingLinkEnabled: true,
  availability: [
    {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
      planIds: ['basic', 'intermediate'],
    },
    {
      dayOfWeek: 1,
      startTime: '14:00',
      endTime: '18:00',
      planIds: ['basic', 'intermediate'],
    },
    {
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '18:00',
      planIds: ['basic', 'intermediate'],
    },
    {
      dayOfWeek: 3,
      startTime: '14:00',
      endTime: '18:00',
      planIds: ['premium'],
    },
    {
      dayOfWeek: 4,
      startTime: '09:00',
      endTime: '12:00',
      planIds: ['basic'],
    },
    {
      dayOfWeek: 5,
      startTime: '09:00',
      endTime: '16:00',
      planIds: ['basic', 'intermediate', 'premium'],
    },
  ],
}

export const scheduleService = {
  getSchedule: async (): Promise<TeacherSchedule> => {
    await delay(500)
    const stored = localStorage.getItem(SCHEDULE_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(mockSchedule))
    return mockSchedule
  },

  updateSchedule: async (
    schedule: TeacherSchedule,
  ): Promise<TeacherSchedule> => {
    await delay(500)
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule))
    return schedule
  },

  updateAvailability: async (
    availability: TimeSlot[],
  ): Promise<TeacherSchedule> => {
    const schedule = await scheduleService.getSchedule()
    const updated = { ...schedule, availability }
    return scheduleService.updateSchedule(updated)
  },

  // Logic to get truly available slots for a specific date
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

    // Generate potential slots from availability
    daySlots.forEach((slot) => {
      let current = parse(slot.startTime, 'HH:mm', date)
      const end = parse(slot.endTime, 'HH:mm', date)

      while (addMinutes(current, duration) <= end) {
        const slotStart = current
        const slotEnd = addMinutes(current, duration)

        // Check collision with existing events
        const hasCollision = events.some((event) => {
          const eventStart = new Date(event.start_time)
          const eventEnd = new Date(event.end_time)

          // Check if event is on the same day
          if (!isSameDay(eventStart, date)) return false

          // Check overlap
          // Overlap logic: (StartA < EndB) and (EndA > StartB)
          return slotStart < eventEnd && slotEnd > eventStart
        })

        if (!hasCollision) {
          availableTimes.push(format(slotStart, 'HH:mm'))
        }

        current = addMinutes(current, duration) // Step by duration or fixed interval? Usually duration.
      }
    })

    return availableTimes.sort()
  },
}
