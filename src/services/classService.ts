import {
  ClassGroup,
  CalendarEvent,
  CreateEventDTO,
  UpdateEventDTO,
} from '@/types'
import { supabase } from '@/lib/supabase/client'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addMinutes,
} from 'date-fns'

const DAYS_MAP = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const classService = {
  getAllClasses: async (): Promise<ClassGroup[]> => {
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*, class_students(student_id, custom_price)')

    if (error) {
      console.error(error)
      return []
    }

    return classes.map((c) => ({
      id: c.id,
      teacherId: c.teacher_id,
      name: c.name,
      schedule: c.schedule || '',
      days: c.days || [],
      startTime: c.start_time,
      duration: c.duration,
      status: c.status as any,
      billingModel: c.billing_model as any,
      price: c.price,
      category: c.category as any,
      studentLimit: c.student_limit,
      meetLink: c.meet_link,
      color: c.color,
      studentIds: c.class_students.map((cs: any) => cs.student_id),
      customStudentPrices: c.class_students.reduce(
        (acc: any, cs: any) => ({
          ...acc,
          [cs.student_id]: cs.custom_price,
        }),
        {},
      ),
    }))
  },

  getByTeacherId: async (teacherId: string): Promise<ClassGroup[]> => {
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*, class_students(student_id, custom_price)')
      .eq('teacher_id', teacherId)

    if (error) return []

    return classes.map((c) => ({
      id: c.id,
      teacherId: c.teacher_id,
      name: c.name,
      schedule: c.schedule || '',
      days: c.days || [],
      startTime: c.start_time,
      duration: c.duration,
      status: c.status as any,
      billingModel: c.billing_model as any,
      price: c.price,
      category: c.category as any,
      studentLimit: c.student_limit,
      meetLink: c.meet_link,
      color: c.color,
      studentIds: c.class_students.map((cs: any) => cs.student_id),
      customStudentPrices: c.class_students.reduce(
        (acc: any, cs: any) => ({
          ...acc,
          [cs.student_id]: cs.custom_price,
        }),
        {},
      ),
    }))
  },

  getClassById: async (id: string): Promise<ClassGroup | undefined> => {
    const { data: c, error } = await supabase
      .from('classes')
      .select('*, class_students(student_id, custom_price)')
      .eq('id', id)
      .single()

    if (error || !c) return undefined

    return {
      id: c.id,
      teacherId: c.teacher_id,
      name: c.name,
      schedule: c.schedule || '',
      days: c.days || [],
      startTime: c.start_time,
      duration: c.duration,
      status: c.status as any,
      billingModel: c.billing_model as any,
      price: c.price,
      category: c.category as any,
      studentLimit: c.student_limit,
      meetLink: c.meet_link,
      color: c.color,
      studentIds: c.class_students.map((cs: any) => cs.student_id),
      customStudentPrices: c.class_students.reduce(
        (acc: any, cs: any) => ({
          ...acc,
          [cs.student_id]: cs.custom_price,
        }),
        {},
      ),
    }
  },

  createClass: async (data: Omit<ClassGroup, 'id'>): Promise<ClassGroup> => {
    // Insert class
    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        teacher_id: data.teacherId,
        name: data.name,
        schedule: data.schedule,
        days: data.days,
        start_time: data.startTime,
        duration: data.duration,
        status: data.status,
        billing_model: data.billingModel,
        price: data.price,
        category: data.category,
        student_limit: data.studentLimit,
        meet_link: data.meetLink,
        color: data.color,
      })
      .select()
      .single()

    if (error) throw error

    // Handle student relations
    if (data.studentIds && data.studentIds.length > 0) {
      const relations = data.studentIds.map((sid) => ({
        class_id: newClass.id,
        student_id: sid,
        custom_price: data.customStudentPrices?.[sid],
      }))
      await supabase.from('class_students').insert(relations)
    }

    return { ...data, id: newClass.id }
  },

  updateClass: async (
    id: string,
    data: Partial<ClassGroup>,
  ): Promise<ClassGroup> => {
    const updates: any = {
      name: data.name,
      schedule: data.schedule,
      days: data.days,
      start_time: data.startTime,
      duration: data.duration,
      status: data.status,
      billing_model: data.billingModel,
      price: data.price,
      category: data.category,
      student_limit: data.studentLimit,
      meet_link: data.meetLink,
      color: data.color,
    }

    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key],
    )

    // Update main table
    await supabase.from('classes').update(updates).eq('id', id)

    // Sync students if provided
    if (data.studentIds) {
      // Delete existing not in new list
      await supabase
        .from('class_students')
        .delete()
        .eq('class_id', id)
        .not('student_id', 'in', `(${data.studentIds.join(',')})`)

      // Upsert (requires conflict handling or check exist)
      // Simple approach: Select existing, filter new, insert
      const { data: existing } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', id)

      const existingIds = existing?.map((e) => e.student_id) || []
      const toInsert = data.studentIds
        .filter((sid) => !existingIds.includes(sid))
        .map((sid) => ({
          class_id: id,
          student_id: sid,
        }))

      if (toInsert.length > 0) {
        await supabase.from('class_students').insert(toInsert)
      }
    }

    const updated = await classService.getClassById(id)
    if (!updated) throw new Error('Update failed')
    return updated
  },

  updateStudentPrice: async (
    classId: string,
    studentId: string,
    price: number,
  ): Promise<void> => {
    await supabase
      .from('class_students')
      .update({ custom_price: price })
      .match({ class_id: classId, student_id: studentId })
  },

  // Events
  getEvents: async (): Promise<CalendarEvent[]> => {
    // 1. Fetch DB events
    const { data: dbEvents } = await supabase.from('events').select('*')

    // 2. Generate auto events from classes
    const classes = await classService.getAllClasses()
    const classEvents: CalendarEvent[] = []

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
            description: `Aula: ${cls.name}`,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            type: 'class',
            student_ids: cls.studentIds,
            color: cls.color || 'green',
            classId: cls.id,
            link: cls.meetLink,
          })
        }
      })
    })

    const mappedDbEvents =
      dbEvents?.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start_time: e.start_time,
        end_time: e.end_time,
        type: e.type as any,
        student_ids: e.student_ids || [],
        color: e.color,
        isSynced: e.is_synced,
      })) || []

    return [...mappedDbEvents, ...classEvents]
  },

  createEvent: async (data: CreateEventDTO): Promise<CalendarEvent> => {
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        type: data.type,
        student_ids: data.student_ids,
        color: data.color,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      type: event.type as any,
      student_ids: event.student_ids,
      color: event.color,
    }
  },

  updateEvent: async (data: UpdateEventDTO): Promise<CalendarEvent> => {
    const { data: event, error } = await supabase
      .from('events')
      .update({
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        type: data.type,
        student_ids: data.student_ids,
        color: data.color,
      })
      .eq('id', data.id)
      .select()
      .single()

    if (error) throw error

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      type: event.type as any,
      student_ids: event.student_ids,
      color: event.color,
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    await supabase.from('events').delete().eq('id', id)
  },
}
