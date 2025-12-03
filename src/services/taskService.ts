import { Task, TaskSubmission, TaskColumn } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) return []

    return data.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type as any,
      classId: t.class_id,
      studentId: t.student_id,
      dueDate: t.due_date,
      status: t.status,
      color: t.color,
      tags: t.tags,
      options: t.options,
    }))
  },

  getTaskById: async (id: string): Promise<Task | undefined> => {
    const { data: t, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !t) return undefined

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type as any,
      classId: t.class_id,
      studentId: t.student_id,
      dueDate: t.due_date,
      status: t.status,
      color: t.color,
      tags: t.tags,
      options: t.options,
    }
  },

  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const { data: t, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        type: task.type,
        class_id: task.classId,
        student_id: task.studentId,
        due_date: task.dueDate,
        status: task.status,
        color: task.color,
        tags: task.tags,
        options: task.options,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type as any,
      classId: t.class_id,
      studentId: t.student_id,
      dueDate: t.due_date,
      status: t.status,
      color: t.color,
      tags: t.tags,
      options: t.options,
    }
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const { data: t, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        // Map other fields as needed
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      type: t.type as any,
      classId: t.class_id,
      studentId: t.student_id,
      dueDate: t.due_date,
      status: t.status,
      color: t.color,
      tags: t.tags,
      options: t.options,
    }
  },

  // Task Columns (Mocked for now or stored in local/teacher prefs, assuming static for MVP as per table not created specifically for dynamic columns per teacher yet, or use 'teacher_schedules' or similar for prefs)
  getTaskColumns: async (): Promise<TaskColumn[]> => {
    return [
      { id: 'open', title: 'Abertas', order: 0 },
      { id: 'in_progress', title: 'Em Progresso', order: 1 },
      { id: 'closed', title: 'Fechadas', order: 2 },
    ]
  },

  saveTaskColumns: async (columns: TaskColumn[]): Promise<void> => {
    // Not implementing persistence for columns in this iteration
  },

  // Submissions
  getSubmissionsByTask: async (taskId: string): Promise<TaskSubmission[]> => {
    const { data, error } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('task_id', taskId)

    if (error) return []

    return data.map((s) => ({
      id: s.id,
      taskId: s.task_id,
      studentId: s.student_id,
      content: s.content,
      selectedOptionId: s.selected_option_id,
      submittedAt: s.submitted_at,
      grade: s.grade,
      feedback: s.feedback,
      status: s.status as any,
    }))
  },

  getSubmissionByStudentAndTask: async (
    studentId: string,
    taskId: string,
  ): Promise<TaskSubmission | undefined> => {
    const { data: s, error } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('student_id', studentId)
      .eq('task_id', taskId)
      .single()

    if (error || !s) return undefined

    return {
      id: s.id,
      taskId: s.task_id,
      studentId: s.student_id,
      content: s.content,
      selectedOptionId: s.selected_option_id,
      submittedAt: s.submitted_at,
      grade: s.grade,
      feedback: s.feedback,
      status: s.status as any,
    }
  },

  submitTask: async (
    submission: Omit<TaskSubmission, 'id' | 'submittedAt' | 'status'>,
  ): Promise<TaskSubmission> => {
    const { data: s, error } = await supabase
      .from('task_submissions')
      .insert({
        task_id: submission.taskId,
        student_id: submission.studentId,
        content: submission.content,
        selected_option_id: submission.selectedOptionId,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: s.id,
      taskId: s.task_id,
      studentId: s.student_id,
      content: s.content,
      selectedOptionId: s.selected_option_id,
      submittedAt: s.submitted_at,
      grade: s.grade,
      feedback: s.feedback,
      status: s.status as any,
    }
  },

  gradeSubmission: async (
    id: string,
    grade: number,
    feedback?: string,
  ): Promise<TaskSubmission> => {
    const { data: s, error } = await supabase
      .from('task_submissions')
      .update({
        grade,
        feedback,
        status: 'graded',
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: s.id,
      taskId: s.task_id,
      studentId: s.student_id,
      content: s.content,
      selectedOptionId: s.selected_option_id,
      submittedAt: s.submitted_at,
      grade: s.grade,
      feedback: s.feedback,
      status: s.status as any,
    }
  },
}
