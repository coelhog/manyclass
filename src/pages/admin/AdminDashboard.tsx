import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Users,
  GraduationCap,
  TrendingUp,
  Activity,
  DollarSign,
  CheckCircle,
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { metricsService } from '@/services/metricsService'
import { DashboardSkeleton } from '@/components/skeletons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const chartConfig = {
  active_users: {
    label: 'Usuários Ativos',
    color: 'hsl(var(--chart-1))',
  },
  new_signups: {
    label: 'Novos Cadastros',
    color: 'hsl(var(--chart-2))',
  },
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    newSignups: 0,
    totalRevenue: 0,
    tasksCompleted: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const [currentMetrics, history] = await Promise.all([
          metricsService.getRealTimeMetrics(today),
          metricsService.getHistory(30), // Last 30 days
        ])

        setMetrics(currentMetrics)

        // Format history for chart
        const formattedHistory = history.map((item) => ({
          date: format(new Date(item.date), 'dd/MM'),
          active_users: item.active_users,
          new_signups: item.new_signups,
        }))
        setChartData(formattedHistory)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground">
            Visão geral do sistema e métricas em tempo real.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
          {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos (Hoje)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Acessaram a plataforma hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Cadastros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.newSignups}</div>
            <p className="text-xs text-muted-foreground">Registrados hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${' '}
              {metrics.totalRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Acumulada hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Concluídas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Entregues pelos alunos hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Professores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold">
                {metrics.totalTeachers}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold">
                {metrics.totalStudents}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Turmas Criadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <span className="text-3xl font-bold">{metrics.totalClasses}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Crescimento Recente</CardTitle>
          <CardDescription>
            Usuários ativos vs Novos cadastros nos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="active_users"
                fill="var(--color-active_users)"
                radius={[4, 4, 0, 0]}
                name="Usuários Ativos"
              />
              <Bar
                dataKey="new_signups"
                fill="var(--color-new_signups)"
                radius={[4, 4, 0, 0]}
                name="Novos Cadastros"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
