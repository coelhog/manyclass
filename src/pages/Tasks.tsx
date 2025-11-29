import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, LayoutGrid, List, X } from 'lucide-react'
import { taskService } from '@/services/taskService'
import { classService } from '@/services/classService'
import { Task, ClassGroup, TaskTag } from '@/types'
import { Link } from 'react-router-dom'
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
import { TableSkeleton } from '@/components/skeletons'
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

const TAG_COLORS = [
  { label: 'Vermelho', value: 'red', class: 'bg-red-500' },
  { label: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { label: 'Verde', value: 'green', class: 'bg-green-500' },
  { label: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
  { label: 'Roxo', value: 'purple', class: 'bg-purple-500' },
  { label: 'Cinza', value: 'gray', class: 'bg-gray-500' },
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
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'text',
    tags: [],
  })
  const [newTag, setNewTag] = useState({ label: '', color: 'gray' })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [t, c] = await Promise.all([
        taskService.getAllTasks(),
        classService.getAllClasses(),
      ])
      setTasks(t)
      setClasses(c)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newTask.title || !newTask.classId || !newTask.dueDate) {
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
        status: 'open',
        options: newTask.options,
        tags: newTask.tags,
      })
      toast({ title: 'Tarefa criada com sucesso!' })
      setIsDialogOpen(false)
      loadData()
      setNewTask({ type: 'text', tags: [] })
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

  const handleTaskMove = async (
    taskId: string,
    newStatus: 'open' | 'closed',
  ) => {
    // Optimistic update
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t,
    )
    setTasks(updatedTasks)

    try {
      await taskService.updateTask(taskId, { status: newStatus })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' })
      loadData() // Revert
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'open' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        Aberta
      </Badge>
    ) : (
      <Badge variant="secondary">Fechada</Badge>
    )
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as 'kanban' | 'list')}
            className="border rounded-md p-1"
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
              <DialogContent className="sm:max-w-[500px]">
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
                  <div className="grid gap-2">
                    <Label>Data de Entrega</Label>
                    <Input
                      type="datetime-local"
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          dueDate: new Date(e.target.value).toISOString(),
                        })
                      }
                    />
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
                        onValueChange={(v) =>
                          setNewTag({ ...newTag, color: v })
                        }
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
                          <X
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
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : viewMode === 'kanban' ? (
        <div className="h-[calc(100vh-250px)]">
          <TaskKanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
        </div>
      ) : (
        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de Entrega</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.tags?.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className={cn('text-[10px]', colorMap[tag.color])}
                        >
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link to={`/tasks/${task.id}`}>
                        {user?.role === 'teacher' ? 'Gerenciar' : 'Ver Tarefa'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageTransition>
  )
}
