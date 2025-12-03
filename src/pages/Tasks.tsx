import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { PageTransition } from '@/components/PageTransition'
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard'
import { TaskList } from '@/components/tasks/TaskList'
import { taskService } from '@/services/taskService'
import { classService } from '@/services/classService'
import { studentService } from '@/services/studentService'
import { Task, ClassGroup, TaskTag, TaskColumn, Student } from '@/types'
import { Plus, Loader2, LayoutGrid, List } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DatePicker } from '@/components/ui/date-picker'

const TAG_COLORS = [
  { label: 'Vermelho', value: 'red', class: 'bg-red-500' },
  { label: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { label: 'Verde', value: 'green', class: 'bg-green-500' },
  { label: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
  { label: 'Roxo', value: 'purple', class: 'bg-purple-500' },
  { label: 'Cinza', value: 'gray', class: 'bg-gray-500' },
]

const EVENT_COLORS = [
  { label: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { label: 'Verde', value: 'green', class: 'bg-green-500' },
  { label: 'Vermelho', value: 'red', class: 'bg-red-500' },
  { label: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
  { label: 'Roxo', value: 'purple', class: 'bg-purple-500' },
  { label: 'Laranja', value: 'orange', class: 'bg-orange-500' },
  { label: 'Rosa', value: 'pink', class: 'bg-pink-500' },
]

const colorMap: Record<string, string> = {
  red: 'bg-red-100 text-red-800 border-red-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
}

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
  const [newTag, setNewTag] = useState({ label: '', color: 'gray' })

  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined)
  const [taskTime, setTaskTime] = useState('')

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

  const handleCreate = async () => {
    if (!newTask.title) {
      toast({
        variant: 'destructive',
        title: 'Título é obrigatório',
      })
      return
    }

    let dueDateIso: string | undefined = undefined
    if (taskDate) {
      const time = taskTime || '00:00'
      // Combine Date object with Time string
      const datePart = taskDate.toISOString().split('T')[0]
      try {
        dueDateIso = new Date(`${datePart}T${time}`).toISOString()
      } catch (e) {
        console.error('Invalid date', e)
      }
    }

    try {
      await taskService.createTask({
        title: newTask.title,
        description: newTask.description || '',
        type: newTask.type as any,
        classId: newTask.classId,
        studentId: newTask.studentId,
        dueDate: dueDateIso,
        status: columns[0]?.id || 'open', // Default to first column
        options: newTask.options,
        tags: newTask.tags,
        color: newTask.color,
      })
      toast({ title: 'Tarefa criada com sucesso!' })
      setIsDialogOpen(false)
      loadData()
      setNewTask({ type: 'text', tags: [], color: 'blue' })
      setTaskDate(undefined)
      setTaskTime('')
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar tarefa' })
    }
  }

  const handleAddTag = () => {
    if (!newTag.label) return
    const tag: TaskTag = {
      id: Math.random().toString(36).substr(2, 9),
      label: newTag.label,
      color: newTag.color,
    }
    setNewTask({ ...newTask, tags: [...(newTask.tags || []), tag] })
    setNewTag({ label: '', color: 'gray' })
  }

  const handleRemoveTag = (tagId: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags?.filter((t) => t.id !== tagId),
    })
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow-md transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Criar Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Tarefa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* ... inputs ... */}
                  <div className="grid gap-2">
                    <Label>Título *</Label>
                    <Input
                      value={newTask.title || ''}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={newTask.description || ''}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Turma (Opcional)</Label>
                      <Select
                        onValueChange={(v) =>
                          setNewTask({
                            ...newTask,
                            classId: v === 'none' ? undefined : v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Aluno (Opcional)</Label>
                      <Select
                        onValueChange={(v) =>
                          setNewTask({
                            ...newTask,
                            studentId: v === 'none' ? undefined : v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* ... other inputs ... */}

                  <div className="grid gap-2">
                    <Label>Data de Entrega (Opcional)</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <DatePicker date={taskDate} setDate={setTaskDate} />
                      </div>
                      <Input
                        type="time"
                        className="w-32"
                        value={taskTime}
                        onChange={(e) => setTaskTime(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Se definida, aparecerá no calendário.
                    </p>
                  </div>

                  {/* ... tags ... */}
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate}>Criar Tarefa</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
    </PageTransition>
  )
}

function XIcon({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onClick={onClick}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
