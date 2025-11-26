import { TeacherSchedule, TimeSlot } from '@/types'

const SCHEDULE_KEY = 'smartclass_schedule'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockSchedule: TeacherSchedule = {
  id: '1',
  teacherId: '1',
  availability: [
    {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
      planIds: ['basic', 'intermediate'],
    },
    {
      dayOfWeek: 3,
      startTime: '14:00',
      endTime: '18:00',
      planIds: ['premium'],
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

  updateAvailability: async (
    availability: TimeSlot[],
  ): Promise<TeacherSchedule> => {
    await delay(500)
    const schedule = await scheduleService.getSchedule()
    const updated = { ...schedule, availability }
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(updated))
    return updated
  },
}
