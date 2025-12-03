import { KanbanColumn, KanbanTask } from '@/types'
import { db } from '@/lib/db'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const COLLECTION_KANBAN_COLS = 'kanban_columns'
const COLLECTION_KANBAN_TASKS = 'kanban_tasks'

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'A Fazer', order: 0 },
  { id: 'in_progress', title: 'Em Progresso', order: 1 },
  { id: 'done', title: 'Concluído', order: 2 },
]

export const kanbanService = {
  getColumns: async (): Promise<KanbanColumn[]> => {
    await delay(300)
    const columns = db.get<KanbanColumn>(COLLECTION_KANBAN_COLS)
    if (columns.length > 0) return columns

    db.set(COLLECTION_KANBAN_COLS, defaultColumns)
    return defaultColumns
  },

  saveColumns: async (columns: KanbanColumn[]): Promise<void> => {
    await delay(200)
    db.set(COLLECTION_KANBAN_COLS, columns)
  },

  getTasks: async (): Promise<KanbanTask[]> => {
    await delay(300)
    return db.get<KanbanTask>(COLLECTION_KANBAN_TASKS)
  },

  saveTasks: async (tasks: KanbanTask[]): Promise<void> => {
    await delay(200)
    db.set(COLLECTION_KANBAN_TASKS, tasks)
  },

  createTask: async (
    task: Omit<KanbanTask, 'id' | 'createdAt'>,
  ): Promise<KanbanTask> => {
    await delay(300)
    const newTask: KanbanTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    return db.insert(COLLECTION_KANBAN_TASKS, newTask)
  },

  updateTask: async (
    id: string,
    updates: Partial<KanbanTask>,
  ): Promise<KanbanTask> => {
    await delay(200)
    return db.update(COLLECTION_KANBAN_TASKS, id, updates)
  },

  deleteTask: async (id: string): Promise<void> => {
    await delay(200)
    db.delete(COLLECTION_KANBAN_TASKS, id)
  },
}
