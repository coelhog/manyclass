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
import { taskService } from '@/services/taskService'
import { classService } from '@/services/classService'
import { Task, ClassGroup, TaskTag, TaskColumn } from '@/types'
import { Plus, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'text',
    tags: [],
    color: 'blue',
  })
  const [newTag, setNewTag] = useState({ label: '', color: 'gray' })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [t, c, cols] = await Promise.all([
        taskService.getAllTasks(),
        classService.getAllClasses(),
        taskService.getTaskColumns(),
      ])
      setTasks(t)
      setClasses(c)
      setColumns(cols.sort((a, b) => a.order - b.order))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newTask.title || !newTask.classId) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }
    try {
      await taskService.createTask({
        title: newTask.title,
        description: newTask.description || '',
        type: newTask.type as any,
        classId: newTask.classId,
        dueDate: newTask.dueDate,
        status: columns[0]?.id || 'open', // Default to first column
        options: newTask.options,
        tags: newTask.tags,
        color: newTask.color,
      })
      toast({ title: 'Tarefa criada com sucesso!' })
      setIsDialogOpen(false)
      loadData()
      setNewTask({ type: 'text', tags: [], color: 'blue' })
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
    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newColumnId } : t,
    )
    setTasks(updatedTasks)

    try {
      await taskService.updateTask(taskId, { status: newColumnId })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' })
      loadData() // Revert
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
                <div className="grid gap-2">
                  <Label>Título</Label>
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
                    <Label>Turma</Label>
                    <Select
                      onValueChange={(v) =>
                        setNewTask({ ...newTask, classId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select
                      defaultValue="text"
                      onValueChange={(v) =>
                        setNewTask({ ...newTask, type: v as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="multiple-choice">
                          Múltipla Escolha
                        </SelectItem>
                        <SelectItem value="file-upload">
                          Upload de Arquivo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data de Entrega (Opcional)</Label>
                    <Input
                      type="datetime-local"
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          dueDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Se definida, aparecerá no calendário.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Cor do Evento</Label>
                    <Select
                      value={newTask.color}
                      onValueChange={(v) =>
                        setNewTask({ ...newTask, color: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${color.class}`}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova tag"
                      value={newTag.label}
                      onChange={(e) =>
                        setNewTag({ ...newTag, label: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Select
                      value={newTag.color}
                      onValueChange={(v) => setNewTag({ ...newTag, color: v })}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${color.class}`}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddTag}
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTask.tags?.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className={cn(
                          'flex items-center gap-1',
                          colorMap[tag.color],
                        )}
                      >
                        {tag.label}
                        <XIcon
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Criar Tarefa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <TaskKanbanBoard
            tasks={tasks}
            columns={columns}
            onTaskMove={handleTaskMove}
            onColumnsChange={handleColumnsChange}
          />
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
