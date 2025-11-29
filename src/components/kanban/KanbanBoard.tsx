import { useState, useEffect } from 'react'
import { KanbanColumn as IKanbanColumn, KanbanTask } from '@/types'
import { kanbanService } from '@/services/kanbanService'
import { KanbanColumn } from './KanbanColumn'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockStudents } from '@/lib/mock-data'

export function KanbanBoard() {
  const [columns, setColumns] = useState<IKanbanColumn[]>([])
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog States
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null)
  const [editingColumn, setEditingColumn] = useState<IKanbanColumn | null>(null)
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null)

  // Form States
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    studentId: 'none',
  })
  const [columnTitle, setColumnTitle] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cols, tks] = await Promise.all([
        kanbanService.getColumns(),
        kanbanService.getTasks(),
      ])
      setColumns(cols.sort((a, b) => a.order - b.order))
      setTasks(tks)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDropTask = async (taskId: string, targetColId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.columnId === targetColId) return

    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, columnId: targetColId } : t,
    )
    setTasks(updatedTasks)

    try {
      await kanbanService.updateTask(taskId, { columnId: targetColId })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao mover tarefa' })
      loadData() // Revert
    }
  }

  const openTaskDialog = (columnId?: string, task?: KanbanTask) => {
    if (task) {
      setEditingTask(task)
      setTaskForm({
        title: task.title,
        description: task.description || '',
        category: task.category || '',
        tags: task.tags.join(', '),
        studentId: task.studentId || 'none',
      })
      setTargetColumnId(task.columnId)
    } else {
      setEditingTask(null)
      setTaskForm({
        title: '',
        description: '',
        category: '',
        tags: '',
        studentId: 'none',
      })
      setTargetColumnId(columnId || columns[0]?.id)
    }
    setIsTaskDialogOpen(true)
  }

  const saveTask = async () => {
    if (!taskForm.title || !targetColumnId) return

    const taskData = {
      title: taskForm.title,
      description: taskForm.description,
      category: taskForm.category,
      tags: taskForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      studentId: taskForm.studentId === 'none' ? undefined : taskForm.studentId,
      columnId: targetColumnId,
      order: 0, // Default to top
    }

    try {
      if (editingTask) {
        await kanbanService.updateTask(editingTask.id, taskData)
        toast({ title: 'Tarefa atualizada' })
      } else {
        await kanbanService.createTask(taskData)
        toast({ title: 'Tarefa criada' })
      }
      setIsTaskDialogOpen(false)
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar tarefa' })
    }
  }

  const deleteTask = async (id: string) => {
    if (confirm('Excluir tarefa?')) {
      try {
        await kanbanService.deleteTask(id)
        setTasks(tasks.filter((t) => t.id !== id))
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao excluir tarefa' })
      }
    }
  }

  const openColumnDialog = (column?: IKanbanColumn) => {
    if (column) {
      setEditingColumn(column)
      setColumnTitle(column.title)
    } else {
      setEditingColumn(null)
      setColumnTitle('')
    }
    setIsColumnDialogOpen(true)
  }

  const saveColumn = async () => {
    if (!columnTitle) return

    try {
      if (editingColumn) {
        const updatedCols = columns.map((c) =>
          c.id === editingColumn.id ? { ...c, title: columnTitle } : c,
        )
        setColumns(updatedCols)
        await kanbanService.saveColumns(updatedCols)
      } else {
        const newCol = {
          id: Math.random().toString(36).substr(2, 9),
          title: columnTitle,
          order: columns.length,
        }
        const updatedCols = [...columns, newCol]
        setColumns(updatedCols)
        await kanbanService.saveColumns(updatedCols)
      }
      setIsColumnDialogOpen(false)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar coluna' })
    }
  }

  const deleteColumn = async (id: string) => {
    if (confirm('Excluir coluna e todas as suas tarefas?')) {
      try {
        const updatedCols = columns.filter((c) => c.id !== id)
        setColumns(updatedCols)
        await kanbanService.saveColumns(updatedCols)
        // Also delete tasks in this column? Or move them? For simplicity, let's keep them orphaned or delete.
        // Ideally backend handles cascade. Here we just update UI.
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao excluir coluna' })
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-4">
        <Button onClick={() => openColumnDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Coluna
        </Button>
      </div>

      <ScrollArea className="flex-1 w-full whitespace-nowrap rounded-md border bg-background/50 p-4">
        <div className="flex gap-4 h-full min-h-[500px]">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasks
                .filter((t) => t.columnId === column.id)
                .sort((a, b) => a.order - b.order)}
              onAddTask={openTaskDialog}
              onEditTask={(t) => openTaskDialog(undefined, t)}
              onDeleteTask={deleteTask}
              onEditColumn={openColumnDialog}
              onDeleteColumn={deleteColumn}
              onDropTask={handleDropTask}
            />
          ))}
          {columns.length === 0 && !isLoading && (
            <div className="flex items-center justify-center w-full text-muted-foreground">
              Nenhuma coluna criada. Comece criando uma coluna.
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={taskForm.category}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, category: e.target.value })
                  }
                  placeholder="Ex: Aula, Admin"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={taskForm.tags}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, tags: e.target.value })
                  }
                  placeholder="Urgente, Revisar"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Associar Aluno (Interno)</Label>
              <Select
                value={taskForm.studentId}
                onValueChange={(v) =>
                  setTaskForm({ ...taskForm, studentId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {mockStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveTask}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Dialog */}
      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingColumn ? 'Editar Coluna' : 'Nova Coluna'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título da Coluna</Label>
              <Input
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveColumn}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
