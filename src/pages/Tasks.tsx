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
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { taskService } from '@/services/taskService'
import { classService } from '@/services/classService'
import { Task, ClassGroup } from '@/types'
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

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<Task>>({ type: 'text' })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [t, c] = await Promise.all([
      taskService.getAllTasks(),
      classService.getAllClasses(),
    ])
    setTasks(t)
    setClasses(c)
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
      })
      toast({ title: 'Tarefa criada com sucesso!' })
      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar tarefa' })
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'open' ? (
      <Badge className="bg-green-100 text-green-800">Aberta</Badge>
    ) : (
      <Badge variant="secondary">Fechada</Badge>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        {user?.role === 'teacher' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Criar Tarefa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data de Entrega</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{task.type}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
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
    </div>
  )
}
