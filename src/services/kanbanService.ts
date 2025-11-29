import { KanbanColumn, KanbanTask } from '@/types'

const KANBAN_COLUMNS_KEY = 'manyclass_kanban_columns'
const KANBAN_TASKS_KEY = 'manyclass_kanban_tasks'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'A Fazer', order: 0 },
  { id: 'in_progress', title: 'Em Progresso', order: 1 },
  { id: 'done', title: 'Concluído', order: 2 },
]

const defaultTasks: KanbanTask[] = [
  {
    id: '1',
    columnId: 'todo',
    title: 'Preparar aula de Inglês B1',
    description: 'Revisar material sobre Present Perfect',
    tags: ['Planejamento', 'Urgente'],
    category: 'Aula',
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    columnId: 'in_progress',
    title: 'Corrigir redações',
    description: 'Turma de Espanhol Avançado',
    tags: ['Correção'],
    category: 'Administrativo',
    order: 0,
    createdAt: new Date().toISOString(),
  },
]

export const kanbanService = {
  getColumns: async (): Promise<KanbanColumn[]> => {
    await delay(300)
    const stored = localStorage.getItem(KANBAN_COLUMNS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(KANBAN_COLUMNS_KEY, JSON.stringify(defaultColumns))
    return defaultColumns
  },

  saveColumns: async (columns: KanbanColumn[]): Promise<void> => {
    await delay(200)
    localStorage.setItem(KANBAN_COLUMNS_KEY, JSON.stringify(columns))
  },

  getTasks: async (): Promise<KanbanTask[]> => {
    await delay(300)
    const stored = localStorage.getItem(KANBAN_TASKS_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(KANBAN_TASKS_KEY, JSON.stringify(defaultTasks))
    return defaultTasks
  },

  saveTasks: async (tasks: KanbanTask[]): Promise<void> => {
    await delay(200)
    localStorage.setItem(KANBAN_TASKS_KEY, JSON.stringify(tasks))
  },

  createTask: async (
    task: Omit<KanbanTask, 'id' | 'createdAt'>,
  ): Promise<KanbanTask> => {
    await delay(300)
    const tasks = await kanbanService.getTasks()
    const newTask: KanbanTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    const updated = [...tasks, newTask]
    await kanbanService.saveTasks(updated)
    return newTask
  },

  updateTask: async (
    id: string,
    updates: Partial<KanbanTask>,
  ): Promise<KanbanTask> => {
    await delay(200)
    const tasks = await kanbanService.getTasks()
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Task not found')

    const updated = { ...tasks[index], ...updates }
    tasks[index] = updated
    await kanbanService.saveTasks(tasks)
    return updated
  },

  deleteTask: async (id: string): Promise<void> => {
    await delay(200)
    const tasks = await kanbanService.getTasks()
    const filtered = tasks.filter((t) => t.id !== id)
    await kanbanService.saveTasks(filtered)
  },
}
