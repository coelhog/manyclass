import { TeacherSchedule, TimeSlot } from '@/types'
import { classService } from './classService'
import { supabase } from '@/lib/supabase/client'
import { addMinutes, parse, isSameDay, format } from 'date-fns'

export const scheduleService = {
  getSchedule: async (): Promise<TeacherSchedule> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    const { data, error } = await supabase
      .from('teacher_schedules')
      .select('*')
      .eq('teacher_id', user.id)
      .single()

    if (data) {
      return {
        id: data.id,
        teacherId: data.teacher_id,
        availability: data.availability || [],
        bookingDuration: data.booking_duration,
        bookingLinkEnabled: data.booking_link_enabled,
      }
    }

    // Create default if not exists
    const { data: newSched } = await supabase
      .from('teacher_schedules')
      .insert({
        teacher_id: user.id,
        availability: [],
      })
      .select()
      .single()

    return {
      id: newSched.id,
      teacherId: newSched.teacher_id,
      availability: [],
      bookingDuration: 60,
      bookingLinkEnabled: true,
    }
  },

  updateSchedule: async (
    schedule: TeacherSchedule,
  ): Promise<TeacherSchedule> => {
    const { data: updated, error } = await supabase
      .from('teacher_schedules')
      .update({
        availability: schedule.availability,
        booking_duration: schedule.bookingDuration,
        booking_link_enabled: schedule.bookingLinkEnabled,
      })
      .eq('id', schedule.id)
      .select()
      .single()

    if (error) throw error

    return {
      id: updated.id,
      teacherId: updated.teacher_id,
      availability: updated.availability,
      bookingDuration: updated.booking_duration,
      bookingLinkEnabled: updated.booking_link_enabled,
    }
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
      // Simple parsing assuming 'HH:mm' format and same date context
      // Note: Parsing needs date context to function correctly with addMinutes
      const currentBase = new Date(date)
      const [startH, startM] = slot.startTime.split(':').map(Number)
      currentBase.setHours(startH, startM, 0, 0)

      const endBase = new Date(date)
      const [endH, endM] = slot.endTime.split(':').map(Number)
      endBase.setHours(endH, endM, 0, 0)

      let current = currentBase

      while (addMinutes(current, duration) <= endBase) {
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
