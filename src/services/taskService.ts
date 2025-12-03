import { Task, TaskSubmission, TaskColumn } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_TASKS = 'tasks'
const COLLECTION_SUBMISSIONS = 'submissions'
const COLLECTION_COLUMNS = 'task_columns'

const defaultTaskColumns: TaskColumn[] = [
  { id: 'open', title: 'Abertas', order: 0 },
  { id: 'in_progress', title: 'Em Progresso', order: 1 },
  { id: 'closed', title: 'Fechadas', order: 2 },
]

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    await delay(500)
    return db.get<Task>(COLLECTION_TASKS)
  },

  getTaskById: async (id: string): Promise<Task | undefined> => {
    return db.getById<Task>(COLLECTION_TASKS, id)
  },

  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    await delay(500)
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) }
    return db.insert(COLLECTION_TASKS, newTask)
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    await delay(300)
    return db.update(COLLECTION_TASKS, id, updates)
  },

  // Task Columns Management
  getTaskColumns: async (): Promise<TaskColumn[]> => {
    await delay(300)
    const columns = db.get<TaskColumn>(COLLECTION_COLUMNS)
    if (columns.length > 0) return columns

    // Initialize default columns if empty
    db.set(COLLECTION_COLUMNS, defaultTaskColumns)
    return defaultTaskColumns
  },

  saveTaskColumns: async (columns: TaskColumn[]): Promise<void> => {
    await delay(200)
    db.set(COLLECTION_COLUMNS, columns)
  },

  // Submissions
  getSubmissionsByTask: async (taskId: string): Promise<TaskSubmission[]> => {
    await delay(300)
    const allSubmissions = db.get<TaskSubmission>(COLLECTION_SUBMISSIONS)
    return allSubmissions.filter((s) => s.taskId === taskId)
  },

  getSubmissionByStudentAndTask: async (
    studentId: string,
    taskId: string,
  ): Promise<TaskSubmission | undefined> => {
    await delay(300)
    const allSubmissions = db.get<TaskSubmission>(COLLECTION_SUBMISSIONS)
    return allSubmissions.find(
      (s) => s.studentId === studentId && s.taskId === taskId,
    )
  },

  submitTask: async (
    submission: Omit<TaskSubmission, 'id' | 'submittedAt' | 'status'>,
  ): Promise<TaskSubmission> => {
    await delay(500)
    const newSubmission: TaskSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    }
    return db.insert(COLLECTION_SUBMISSIONS, newSubmission)
  },

  gradeSubmission: async (
    id: string,
    grade: number,
    feedback?: string,
  ): Promise<TaskSubmission> => {
    await delay(300)
    return db.update(COLLECTION_SUBMISSIONS, id, {
      grade,
      feedback,
      status: 'graded',
    })
  },
}
