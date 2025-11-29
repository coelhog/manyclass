import { Task, TaskSubmission } from '@/types'
import { mockTasks, mockSubmissions } from '@/lib/mock-data'

const TASKS_KEY = 'smartclass_tasks'
const SUBMISSIONS_KEY = 'smartclass_submissions'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Enhance mock tasks with tags
const enhancedMockTasks: Task[] = mockTasks.map((task) => ({
  ...task,
  tags:
    task.id === '1'
      ? [{ id: 't1', label: 'Urgente', color: 'red' }]
      : task.id === '2'
        ? [{ id: 't2', label: 'Revisão', color: 'blue' }]
        : [],
}))

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
