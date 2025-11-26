import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { studentService } from '@/services/studentService'
import { classService } from '@/services/classService'
import { Student, ClassGroup } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Mail, Phone, Calendar, BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const studentData = await studentService.getById(id)
        if (studentData) {
          setStudent(studentData)
          const allClasses = await classService.getAllClasses()
          const studentClasses = allClasses.filter((c) =>
            c.studentIds.includes(id),
          )
          setClasses(studentClasses)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!student) {
    return <div>Aluno não encontrado</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/students">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Detalhes do Aluno</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={student.avatar} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{student.name}</CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              <Badge>{student.level}</Badge>
              <Badge
                variant={student.status === 'active' ? 'default' : 'secondary'}
              >
                {student.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Desde {new Date(student.joinedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="classes">
            <TabsList>
              <TabsTrigger value="classes">Turmas</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="classes" className="space-y-4 mt-4">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <Card key={cls.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {cls.schedule}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{cls.status}</Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma turma encontrada.
                </p>
              )}
            </TabsContent>
            <TabsContent value="tasks">
              <div className="p-4 border rounded-md bg-muted/10 text-center text-muted-foreground">
                Funcionalidade de histórico de tarefas em desenvolvimento.
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="p-4 border rounded-md bg-muted/10 text-center text-muted-foreground">
                Histórico acadêmico completo em breve.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
