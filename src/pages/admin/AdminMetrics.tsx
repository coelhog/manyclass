import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, Users, DollarSign, CheckCircle } from 'lucide-react'

const activityData = [
  { date: '2024-01', activeUsers: 120, tasksCompleted: 450 },
  { date: '2024-02', activeUsers: 145, tasksCompleted: 520 },
  { date: '2024-03', activeUsers: 180, tasksCompleted: 680 },
  { date: '2024-04', activeUsers: 220, tasksCompleted: 890 },
  { date: '2024-05', activeUsers: 260, tasksCompleted: 1100 },
  { date: '2024-06', activeUsers: 310, tasksCompleted: 1400 },
]

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Fev', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Abr', revenue: 22000 },
  { month: 'Mai', revenue: 28000 },
  { month: 'Jun', revenue: 35000 },
]

const chartConfig = {
  activeUsers: {
    label: 'Usuários Ativos',
    color: 'hsl(var(--chart-1))',
  },
  tasksCompleted: {
    label: 'Tarefas Concluídas',
    color: 'hsl(var(--chart-2))',
  },
  revenue: {
    label: 'Receita (R$)',
    color: 'hsl(var(--chart-3))',
  },
}

export default function AdminMetrics() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Métricas da Plataforma
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho e crescimento do sistema.
        </p>
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
            <div className="text-2xl font-bold">310</div>
            <p className="text-xs text-muted-foreground">
              +12% vs semana passada
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Cadastros (Mês)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+5% vs mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Tarefas entregues no prazo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 35.000</div>
            <p className="text-xs text-muted-foreground">+25% vs mês passado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade da Plataforma</CardTitle>
            <CardDescription>
              Usuários ativos e tarefas concluídas nos últimos 6 meses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={activityData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stackId="1"
                  stroke="var(--color-activeUsers)"
                  fill="var(--color-activeUsers)"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="tasksCompleted"
                  stackId="2"
                  stroke="var(--color-tasksCompleted)"
                  fill="var(--color-tasksCompleted)"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Receita</CardTitle>
            <CardDescription>Faturamento mensal da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={revenueData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
