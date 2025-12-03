import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { studentService } from '@/services/studentService'
import { classService } from '@/services/classService'
import { noteService } from '@/services/noteService'
import { Student, ClassGroup, CalendarEvent, ClassNote } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Lock,
  FileText,
  CheckCircle2,
  History,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTransition } from '@/components/PageTransition'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/RichTextEditor'
import { useAuth } from '@/contexts/AuthContext'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [historyEvents, setHistoryEvents] = useState<CalendarEvent[]>([])
  const [notes, setNotes] = useState<ClassNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')

  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  const { toast } = useToast()

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

          // Fetch History (Events)
          // Note: In a real app, we would fetch from a dedicated history endpoint
          // Here we get all events and filter by student and past date
          const allEvents = await classService.getEvents()
          const pastEvents = allEvents
            .filter(
              (e) =>
                e.student_ids.includes(id) &&
                isPast(new Date(e.end_time)) &&
                e.type === 'class',
            )
            .sort(
              (a, b) =>
                new Date(b.start_time).getTime() -
                new Date(a.start_time).getTime(),
            )
          setHistoryEvents(pastEvents)

          // Fetch Notes
          const studentNotes = await noteService.getByStudentId(id)
          setNotes(studentNotes)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleUpdatePassword = async () => {
    if (!student || !newPassword) return
    try {
      await studentService.update(student.id, { password: newPassword })
      toast({ title: 'Senha atualizada com sucesso!' })
      setNewPassword('')
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar senha' })
    }
  }

  const handleOpenNote = (event: CalendarEvent) => {
    setSelectedEvent(event)
    const existingNote = notes.find((n) => n.eventId === event.id)
    setNoteContent(existingNote?.content || '')
    setIsNoteModalOpen(true)
  }

  const handleSaveNote = async () => {
    if (!selectedEvent || !student || !user) return
    setIsSavingNote(true)
    try {
      const savedNote = await noteService.save({
        eventId: selectedEvent.id,
        classId: selectedEvent.classId,
        studentId: student.id,
        teacherId: user.id,
        content: noteContent,
      })

      // Update local state
      const updatedNotes = [
        ...notes.filter((n) => n.id !== savedNote.id),
        savedNote,
      ]
      setNotes(updatedNotes)

      toast({ title: 'Anotações salvas com sucesso!' })
      setIsNoteModalOpen(false)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar anotações' })
    } finally {
      setIsSavingNote(false)
    }
  }

  if (isLoading) {
    return (
      <PageTransition className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] md:col-span-2 rounded-xl" />
        </div>
      </PageTransition>
    )
  }

  if (!student) {
    return <div>Aluno não encontrado</div>
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hover:bg-muted/50"
        >
          <Link to="/students">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Detalhes do Aluno</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-32 w-32 ring-4 ring-background shadow-md">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{student.name}</CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                <Badge>{student.level}</Badge>
                <Badge
                  variant={
                    student.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {student.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone || 'Sem telefone'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Desde {new Date(student.joinedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'teacher' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Gerenciar Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••"
                    />
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={!newPassword}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="history">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="history">Histórico de Aulas</TabsTrigger>
              <TabsTrigger value="classes">Turmas Matriculadas</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            </TabsList>

            <TabsContent
              value="history"
              className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="space-y-4">
                {historyEvents.length > 0 ? (
                  historyEvents.map((event) => {
                    const hasNote = notes.some((n) => n.eventId === event.id)
                    const startDate = new Date(event.start_time)
                    return (
                      <Card
                        key={event.id}
                        className="hover:bg-muted/5 transition-colors"
                      >
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-green-100 text-green-700 p-2 rounded-full">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(startDate, "d 'de' MMMM, HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          </div>

                          {user?.role === 'teacher' && (
                            <Button
                              variant={hasNote ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => handleOpenNote(event)}
                              className="gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              {hasNote ? 'Ver/Editar Notas' : 'Adicionar Notas'}
                            </Button>
                          )}
                          {user?.role === 'student' && hasNote && (
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              Com feedback
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-md bg-muted/10">
                    <History className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma aula concluída encontrada.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="classes"
              className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <Card
                    key={cls.id}
                    className="hover:shadow-md transition-shadow"
                  >
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
          </Tabs>
        </div>
      </div>

      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Anotações da Aula</DialogTitle>
            <div className="text-sm text-muted-foreground">
              {selectedEvent?.title} -{' '}
              {selectedEvent &&
                format(new Date(selectedEvent.start_time), 'dd/MM/yyyy')}
            </div>
          </DialogHeader>
          <div className="flex-1 py-4 overflow-hidden">
            <RichTextEditor
              value={noteContent}
              onChange={setNoteContent}
              placeholder="Escreva suas observações sobre o desempenho do aluno..."
              className="h-full min-h-[300px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNote} disabled={isSavingNote}>
              {isSavingNote ? 'Salvando...' : 'Salvar Anotações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
