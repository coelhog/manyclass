import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { taskService } from '@/services/taskService'
import { studentService } from '@/services/studentService'
import { Task, TaskSubmission, Student } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import StudentTaskSubmission from './StudentTaskSubmission'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [task, setTask] = useState<Task | null>(null)
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    if (!id) return
    const t = await taskService.getTaskById(id)
    setTask(t || null)
    
    if (user?.role === 'teacher') {
      const subs = await taskService.getSubmissionsByTask(id)
      setSubmissions(subs)
      const allStudents = await studentService.getAll()
      setStudents(allStudents)
    }
  }

  const handleGrade = async (submissionId: string, grade: number) => {
    try {
      await taskService.gradeSubmission(submissionId, grade)
      toast({ title: 'Nota atribuída com sucesso!' })
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atribuir nota' })
    }
  }

  if (!task) return <div>Carregando...</div>

  // If student, show submission view
  if (user?.role === 'student') {
    return <StudentTaskSubmission task={task} />
  }

  // Teacher View
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/tasks"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{task.type}</Badge>
            <span className="text-sm text-muted-foreground">Vence em {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissões ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {submissions.map(sub => {
              const student = students.find(s => s.id === sub.studentId)
              return (
                <div key={sub.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{student?.name || 'Aluno Desconhecido'}</p>
                      <p className="text-sm text-muted-foreground">Enviado em {new Date(sub.submittedAt).toLocaleString()}</p>
                    </div>
                    <Badge variant={sub.status === 'graded' ? 'default' : 'secondary'}>
                      {sub.status === 'graded' ? `Nota: ${sub.grade}` : 'Pendente'}
                    </Badge>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md text-sm">
                    {task.type === 'text' && <p>{sub.content}</p>}
                    {task.type === 'multiple-choice' && <p>Opção selecionada: {sub.selectedOptionId}</p>}
                    {task.type === 'file-upload' && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Arquivo enviado</span>
                        <Button variant="link" size="sm" className="h-auto p-0 ml-2">Baixar</Button>
                      </div>
                    )}
                  </div>

                  {sub.status === 'pending' && (
                    <div className="flex items-end gap-2 max-w-xs">
                      <div className="grid gap-1 flex-1">
                        <Label htmlFor={`grade-${sub.id}`}>Atribuir Nota (0-10)</Label>
                        <Input 
                          id={`grade-${sub.id}`} 
                          type="number" 
                          min="0" 
                          max="10" 
                          placeholder="Ex: 8.5"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleGrade(sub.id, Number(e.currentTarget.value))
                            }
                          }}
                        />
                      </div>
                      <Button size="sm" onClick={(e) => {
                        const input = document.getElementById={`grade-${sub.id}`) as HTMLInputElement
                        handleGrade(sub.id, Number(input.value))
                      }}>Salvar</Button>
                    </div>
                  )}
                </div>
              )
            })}
            {submissions.length === 0 && <p className="text-muted-foreground text-center">Nenhuma submissão ainda.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
