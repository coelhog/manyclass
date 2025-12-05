import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { PageTransition } from '@/components/PageTransition'
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskDialog } from '@/components/tasks/TaskDialog'
import { taskService } from '@/services/taskService'
import { classService } from '@/services/classService'
import { studentService } from '@/services/studentService'
import { Task, ClassGroup, TaskColumn, Student } from '@/types'
import { Plus, Loader2, LayoutGrid, List } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<TaskColumn[]>([])
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'text',
    tags: [],
    color: 'blue',
  })

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [t, c, cols, s] = await Promise.all([
        taskService.getAllTasks(),
        classService.getAllClasses(),
        taskService.getTaskColumns(),
        studentService.getAll(),
      ])
      setTasks(t)
      setClasses(c)
      setColumns(cols.sort((a, b) => a.order - b.order))
      setStudents(s)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrUpdate = async (
    taskData: Partial<Task>,
    date?: Date,
    time?: string,
  ) => {
    if (!taskData.title) {
      toast({
        variant: 'destructive',
        title: 'Título é obrigatório',
      })
      return
    }

    let dueDateIso: string | undefined = undefined
    if (date) {
      const t = time || '00:00'
      const datePart = date.toISOString().split('T')[0]
      try {
        dueDateIso = new Date(`${datePart}T${t}`).toISOString()
      } catch (e) {
        console.error('Invalid date', e)
      }
    }

    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      type: taskData.type as any,
      classId: taskData.classId,
      studentId: taskData.studentId,
      dueDate: dueDateIso,
      status: taskData.status || columns[0]?.id || 'open',
      options: taskData.options,
      tags: taskData.tags,
      color: taskData.color,
    }

    try {
      if (taskData.id) {
        await taskService.updateTask(taskData.id, payload)
        toast({ title: 'Tarefa atualizada!' })
      } else {
        await taskService.createTask(payload)
        toast({ title: 'Tarefa criada com sucesso!' })
      }
      setIsDialogOpen(false)
      loadData()
      setNewTask({ type: 'text', tags: [], color: 'blue' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar tarefa' })
    }
  }

  const handleTaskMove = async (taskId: string, newColumnId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newColumnId } : t,
    )
    setTasks(updatedTasks)

    try {
      await taskService.updateTask(taskId, { status: newColumnId })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' })
      loadData()
    }
  }

  const handleColumnsChange = async (newColumns: TaskColumn[]) => {
    setColumns(newColumns)
    try {
      await taskService.saveTaskColumns(newColumns)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar colunas' })
    }
  }

  return (
    <PageTransition className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie as tarefas das suas turmas.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as 'kanban' | 'list')}
          >
            <ToggleGroupItem value="kanban" aria-label="Kanban View">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List View">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {user?.role === 'teacher' && (
            <Button
              className="shadow-sm hover:shadow-md transition-all"
              onClick={() => {
                setNewTask({ type: 'text', tags: [], color: 'blue' })
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Tarefa
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          {view === 'kanban' ? (
            <TaskKanbanBoard
              tasks={tasks}
              columns={columns}
              onTaskMove={handleTaskMove}
              onColumnsChange={handleColumnsChange}
            />
          ) : (
            <TaskList tasks={tasks} columns={columns} classes={classes} />
          )}
        </div>
      )}

      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleCreateOrUpdate}
        classes={classes}
        students={students}
        initialData={newTask}
      />
    </PageTransition>
  )
}
