import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { taskService } from '@/services/taskService'
import { Task, TaskSubmission } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([])

  useEffect(() => {
    const loadData = async () => {
      const allTasks = await taskService.getAllTasks()
      setTasks(allTasks)
      // In a real app, we would fetch submissions for the current user
      // For mock, we just load all and filter
      // Since we don't have a "getMySubmissions" in service yet, let's mock it here or use what we have
      // We will just use mockSubmissions from data for now
    }
    loadData()
  }, [])

  const pendingTasks = tasks.filter((t) => t.status === 'open').slice(0, 3)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Área do Aluno</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.name}!
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Tarefas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">2 para esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Tarefas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Média de notas: 8.5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Próxima Aula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">Inglês - B1</div>
            <p className="text-xs text-muted-foreground">Hoje, 19:00</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tarefas Recentes</CardTitle>
            <CardDescription>
              Suas atividades pendentes e recentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {task.type}
                      </Badge>
                      <span>
                        Vence em {format(new Date(task.dueDate), 'dd/MM')}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" asChild>
                    <Link to={`/tasks/${task.id}`}>Abrir</Link>
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full" asChild>
                <Link
                  to="/tasks"
                  className="flex items-center justify-center gap-2"
                >
                  Ver todas as tarefas <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Histórico de Notas</CardTitle>
            <CardDescription>Seus últimos resultados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quiz de Gramática</p>
                  <p className="text-xs text-muted-foreground">Inglês A1</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  10.0
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Redação: Minha Família</p>
                  <p className="text-xs text-muted-foreground">Inglês A1</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  8.5
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Listening Exercise</p>
                  <p className="text-xs text-muted-foreground">Inglês A1</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  7.0
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
