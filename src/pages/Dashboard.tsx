import { useAuth } from '@/contexts/AuthContext'
import StudentDashboard from './StudentDashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BookOpen, CheckCircle, DollarSign, Users, Video } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { PageTransition } from '@/components/PageTransition'
import { DashboardSkeleton } from '@/components/skeletons'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { studentService } from '@/services/studentService'
import { classService } from '@/services/classService'
import { taskService } from '@/services/taskService'
import { ClassGroup } from '@/types'

const chartConfig = {
  revenue: {
    label: 'Receita',
    color: 'hsl(var(--primary))',
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalClasses, setTotalClasses] = useState(0)
  const [activeClasses, setActiveClasses] = useState<ClassGroup[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [pendingTasksCount, setPendingTasksCount] = useState(0)

  // Mock chart data for now, in a real scenario this would be calculated from historical payments/classes
  const chartData = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Fev', revenue: 1500 },
    { month: 'Mar', revenue: 1800 },
    { month: 'Abr', revenue: 2200 },
    { month: 'Mai', revenue: 2500 },
    { month: 'Jun', revenue: 2800 },
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        // Fetch data for logged-in teacher
        const [students, classes, tasks] = await Promise.all([
          studentService.getByTeacherId(user.id),
          classService.getByTeacherId(user.id),
          taskService.getAllTasks(), // Filtering tasks would be better if taskService supported it
        ])

        setTotalStudents(students.length)
        setTotalClasses(classes.length)
        setActiveClasses(classes.filter((c) => c.status === 'active'))

        // Calculate Revenue (Monthly Projection)
        let revenue = 0
        classes
          .filter((c) => c.status === 'active')
          .forEach((c) => {
            if (c.billingModel === 'per_class') {
              revenue += c.price
            } else if (c.billingModel === 'per_student') {
              // Sum specific prices for each student
              c.studentIds.forEach((sid) => {
                const studentPrice = c.customStudentPrices?.[sid] ?? c.price
                revenue += studentPrice
              })
            }
          })
        setMonthlyRevenue(revenue)

        // Calculate pending tasks (mock logic since tasks don't link to teacher directly in mock yet)
        // Assuming tasks belong to teacher's classes
        const teacherClassIds = classes.map((c) => c.id)
        const teacherTasks = tasks.filter(
          (t) => t.classId && teacherClassIds.includes(t.classId),
        )
        setPendingTasksCount(
          teacherTasks.filter((t) => t.status === 'open').length,
        )
      } catch (error) {
        console.error('Error loading dashboard data', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (user?.role === 'student') {
    return <StudentDashboard />
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Bem-vindo de volta,{' '}
          <span className="font-medium text-foreground">{user?.name}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Ativos em suas turmas
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClasses.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalClasses} turmas no total
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Pendentes
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando revisão</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal (Est.)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {monthlyRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado nas turmas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Content Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Conteúdos da Plataforma
          </CardTitle>
          <CardDescription>
            Aulas e materiais disponibilizados pela administração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background/80 p-4 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                  <Video className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-sm">
                  Metodologia de Ensino {i}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Atualizado há 2 dias
                </p>
                <Button size="sm" variant="secondary" className="w-full mt-3">
                  Acessar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Receita Recente</CardTitle>
            <CardDescription>Visão geral dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
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
        <Card className="col-span-3 hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Próximas Aulas</CardTitle>
            <CardDescription>Sua agenda para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {activeClasses.slice(0, 5).map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center group cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {cls.name.charAt(0)}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                      {cls.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cls.schedule}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">
                    {cls.studentIds.length} alunos
                  </div>
                </div>
              ))}
              {activeClasses.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  Nenhuma turma ativa encontrada.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
