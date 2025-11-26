import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { taskService } from '@/services/taskService'
import { Task } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageTransition } from '@/components/PageTransition'
import { DashboardSkeleton } from '@/components/skeletons'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const allTasks = await taskService.getAllTasks()
        setTasks(allTasks)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const pendingTasks = tasks.filter((t) => t.status === 'open').slice(0, 3)

  if (isLoading) {
    return (
      <PageTransition>
        <DashboardSkeleton />
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-8">
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
        <Card className="bg-primary/10 border-primary/20 hover:bg-primary/15 transition-colors">
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
        <Card className="hover:shadow-md transition-shadow">
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
        <Card className="hover:shadow-md transition-shadow">
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
        <Card className="col-span-1 hover:shadow-md transition-shadow">
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
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 group"
                >
                  <div className="space-y-1">
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {task.type}
                      </Badge>
                      <span>
                        Vence em {format(new Date(task.dueDate), 'dd/MM')}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Link to={`/tasks/${task.id}`}>Abrir</Link>
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full group" asChild>
                <Link
                  to="/tasks"
                  className="flex items-center justify-center gap-2"
                >
                  Ver todas as tarefas{' '}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Histórico de Notas</CardTitle>
            <CardDescription>Seus últimos resultados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">Quiz de Gramática</p>
                  <p className="text-xs text-muted-foreground">Inglês A1</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  10.0
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">Redação: Minha Família</p>
                  <p className="text-xs text-muted-foreground">Inglês A1</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  8.5
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
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
    </PageTransition>
  )
}
