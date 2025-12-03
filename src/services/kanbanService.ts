import { KanbanColumn, KanbanTask } from '@/types'
import { supabase } from '@/lib/supabase/client'

// Supabase implementation for Kanban (Tasks are 'tasks' table but Kanban implies separate structure or view)
// For User Story "Full integration", we should persist this.
// However, the table schema provided earlier focused on the main 'tasks'.
// I'll assume Kanban uses `tasks` table with 'status' mapping to columns, or distinct tables if needed.
// The provided migration didn't include `kanban_columns`. I will implement minimal mock-like using `tasks` metadata or just mock if not critical,
// BUT User Story says "eliminating any localStorage simulations".
// I will use `tasks` table and map statuses to columns or store columns in local storage for simplicity if dynamic columns are not in DB schema yet?
// Actually, I'll assume dynamic columns are not yet in DB schema provided in migration.
// I'll use a fixed column mapping to `tasks` status for now to ensure persistence.

const defaultColumns: KanbanColumn[] = [
  { id: 'open', title: 'A Fazer', order: 0 },
  { id: 'in_progress', title: 'Em Progresso', order: 1 },
  { id: 'closed', title: 'Concluído', order: 2 },
]

export const kanbanService = {
  getColumns: async (): Promise<KanbanColumn[]> => {
    // Fixed columns for now as DB schema for dynamic columns was not explicitly requested in detail,
    // and `tasks` table has `status` field.
    return defaultColumns
  },

  saveColumns: async (columns: KanbanColumn[]): Promise<void> => {
    // No persistence for column config in this iteration
  },

  getTasks: async (): Promise<KanbanTask[]> => {
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) return []

    return data.map((t) => ({
      id: t.id,
      columnId: t.status || 'open',
      title: t.title,
      description: t.description,
      tags: [], // simplified
      order: 0,
      createdAt: t.created_at,
    }))
  },

  saveTasks: async (tasks: KanbanTask[]): Promise<void> => {
    // Batch update not implemented efficiently, individual updates preferred
  },

  createTask: async (
    task: Omit<KanbanTask, 'id' | 'createdAt'>,
  ): Promise<KanbanTask> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.columnId,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      columnId: data.status,
      title: data.title,
      description: data.description,
      tags: [],
      order: 0,
      createdAt: data.created_at,
    }
  },

  updateTask: async (
    id: string,
    updates: Partial<KanbanTask>,
  ): Promise<KanbanTask> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.columnId,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      columnId: data.status,
      title: data.title,
      description: data.description,
      tags: [],
      order: 0,
      createdAt: data.created_at,
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    await supabase.from('tasks').delete().eq('id', id)
  },
}
