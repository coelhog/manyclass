import { Task, TaskSubmission, TaskColumn } from '@/types'
import { mockTasks, mockSubmissions } from '@/lib/mock-data'

const TASKS_KEY = 'manyclass_tasks'
const SUBMISSIONS_KEY = 'manyclass_submissions'
const TASK_COLUMNS_KEY = 'manyclass_task_columns'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Enhance mock tasks with tags and map status to default columns
const enhancedMockTasks: Task[] = mockTasks.map((task) => ({
  ...task,
  status: task.status === 'open' ? 'open' : 'closed', // Ensure mapping to default columns
  tags:
    task.id === '1'
      ? [{ id: 't1', label: 'Urgente', color: 'red' }]
      : task.id === '2'
        ? [{ id: 't2', label: 'Revisão', color: 'blue' }]
        : [],
  color: 'blue', // Default color
}))

const defaultTaskColumns: TaskColumn[] = [
  { id: 'open', title: 'Abertas', order: 0 },
  { id: 'in_progress', title: 'Em Progresso', order: 1 },
  { id: 'closed', title: 'Fechadas', order: 2 },
]

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    await delay(500)
    const stored = localStorage.getItem(TASKS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(TASKS_KEY, JSON.stringify(enhancedMockTasks))
    return enhancedMockTasks
  },

  getTaskById: async (id: string): Promise<Task | undefined> => {
    const tasks = await taskService.getAllTasks()
    return tasks.find((t) => t.id === id)
  },

  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    await delay(500)
    const tasks = await taskService.getAllTasks()
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) }
    const updated = [...tasks, newTask]
    localStorage.setItem(TASKS_KEY, JSON.stringify(updated))
    return newTask
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    await delay(300)
    const tasks = await taskService.getAllTasks()
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Task not found')

    const updated = { ...tasks[index], ...updates }
    tasks[index] = updated
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    return updated
  },

  // Task Columns Management
  getTaskColumns: async (): Promise<TaskColumn[]> => {
    await delay(300)
    const stored = localStorage.getItem(TASK_COLUMNS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(TASK_COLUMNS_KEY, JSON.stringify(defaultTaskColumns))
    return defaultTaskColumns
  },

  saveTaskColumns: async (columns: TaskColumn[]): Promise<void> => {
    await delay(200)
    localStorage.setItem(TASK_COLUMNS_KEY, JSON.stringify(columns))
  },

  // Submissions
  getSubmissionsByTask: async (taskId: string): Promise<TaskSubmission[]> => {
    await delay(300)
    const stored = localStorage.getItem(SUBMISSIONS_KEY)
    const allSubmissions: TaskSubmission[] = stored
      ? JSON.parse(stored)
      : mockSubmissions
    return allSubmissions.filter((s) => s.taskId === taskId)
  },

  getSubmissionByStudentAndTask: async (
    studentId: string,
    taskId: string,
  ): Promise<TaskSubmission | undefined> => {
    await delay(300)
    const stored = localStorage.getItem(SUBMISSIONS_KEY)
    const allSubmissions: TaskSubmission[] = stored
      ? JSON.parse(stored)
      : mockSubmissions
    return allSubmissions.find(
      (s) => s.studentId === studentId && s.taskId === taskId,
    )
  },

  submitTask: async (
    submission: Omit<TaskSubmission, 'id' | 'submittedAt' | 'status'>,
  ): Promise<TaskSubmission> => {
    await delay(500)
    const stored = localStorage.getItem(SUBMISSIONS_KEY)
    const allSubmissions: TaskSubmission[] = stored
      ? JSON.parse(stored)
      : mockSubmissions

    const newSubmission: TaskSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    }

    const updated = [...allSubmissions, newSubmission]
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated))
    return newSubmission
  },

  gradeSubmission: async (
    id: string,
    grade: number,
    feedback?: string,
  ): Promise<TaskSubmission> => {
    await delay(300)
    const stored = localStorage.getItem(SUBMISSIONS_KEY)
    const allSubmissions: TaskSubmission[] = stored
      ? JSON.parse(stored)
      : mockSubmissions

    const index = allSubmissions.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Submission not found')

    const updatedSubmission = {
      ...allSubmissions[index],
      grade,
      feedback,
      status: 'graded' as const,
    }
    allSubmissions[index] = updatedSubmission
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(allSubmissions))
    return updatedSubmission
  },
}
