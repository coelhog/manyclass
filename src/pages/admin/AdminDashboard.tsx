import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, GraduationCap, TrendingUp, Activity } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { teacherService } from '@/services/teacherService'
import { studentService } from '@/services/studentService'
import { courseService } from '@/services/courseService'
import { onboardingService } from '@/services/onboardingService'
import { DashboardSkeleton } from '@/components/skeletons'

const chartConfig = {
  teachers: {
    label: 'Professores',
    color: 'hsl(var(--chart-1))',
  },
  students: {
    label: 'Alunos',
    color: 'hsl(var(--chart-2))',
  },
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalCourses, setTotalCourses] = useState(0)
  const [totalResponses, setTotalResponses] = useState(0)

  // Mock data for chart - in a real app this would come from an analytics service
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true)
      try {
        const [teachers, students, courses, responses] = await Promise.all([
          teacherService.getAll(),
          studentService.getAll(),
          courseService.getAll(),
          onboardingService.getAllResponses(),
        ])

        setTotalTeachers(teachers.length)
        setTotalStudents(students.length)
        setTotalCourses(courses.length)
        setTotalResponses(responses.length)

        // Simulate chart data based on current counts
        setChartData([
          {
            name: 'Atual',
            teachers: teachers.length,
            students: students.length,
          },
          {
            name: 'Proj. Mês',
            teachers: teachers.length + 2,
            students: students.length + 10,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Professores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados na plataforma
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Alunos vinculados a professores
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cursos da Plataforma
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Conteúdos disponibilizados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Respostas de Onboarding
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">Feedback coletado</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Crescimento da Plataforma</CardTitle>
          <CardDescription>Visão geral de usuários</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="teachers"
                fill="var(--color-teachers)"
                radius={[4, 4, 0, 0]}
                name="Professores"
              />
              <Bar
                dataKey="students"
                fill="var(--color-students)"
                radius={[4, 4, 0, 0]}
                name="Alunos"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
