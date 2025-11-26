import { useEffect, useState } from 'react'
import { Task, TaskSubmission } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { taskService } from '@/services/taskService'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface Props {
  task: Task
}

export default function StudentTaskSubmission({ task }: Props) {
  const { user } = useAuth()
  const [submission, setSubmission] = useState<TaskSubmission | null>(null)
  const [content, setContent] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      taskService
        .getSubmissionByStudentAndTask(user.id, task.id)
        .then((sub) => {
          if (sub) setSubmission(sub)
        })
    }
  }, [user, task.id])

  const handleSubmit = async () => {
    if (!user) return
    try {
      const newSub = await taskService.submitTask({
        taskId: task.id,
        studentId: user.id,
        content: task.type === 'text' ? content : undefined,
        selectedOptionId:
          task.type === 'multiple-choice' ? selectedOption : undefined,
      })
      setSubmission(newSub)
      toast({ title: 'Tarefa enviada com sucesso!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao enviar tarefa' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/tasks">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <p className="text-muted-foreground">{task.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Sua Resposta</CardTitle>
            {submission && (
              <Badge
                variant={
                  submission.status === 'graded' ? 'default' : 'secondary'
                }
              >
                {submission.status === 'graded'
                  ? `Nota: ${submission.grade}`
                  : 'Enviado'}
              </Badge>
            )}
          </div>
          <CardDescription>
            {submission
              ? 'Você já enviou esta tarefa.'
              : 'Preencha abaixo para enviar.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submission ? (
            <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h3 className="font-semibold text-lg">Tarefa Entregue!</h3>
              <p className="text-sm text-muted-foreground">
                Enviado em {new Date(submission.submittedAt).toLocaleString()}
              </p>
              {submission.grade && (
                <p className="font-bold text-xl mt-2">
                  Nota: {submission.grade}
                </p>
              )}
            </div>
          ) : (
            <>
              {task.type === 'text' && (
                <Textarea
                  placeholder="Digite sua resposta aqui..."
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}

              {task.type === 'multiple-choice' && task.options && (
                <RadioGroup
                  onValueChange={setSelectedOption}
                  value={selectedOption}
                >
                  {task.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent/50"
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} />
                      <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {task.type === 'file-upload' && (
                <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-accent/5 transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="font-medium">
                    Clique para fazer upload ou arraste um arquivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, JPG (Max 10MB)
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => {
                      // Mock upload
                      toast({ title: 'Arquivo "trabalho.pdf" anexado' })
                      setContent('file-url-mock')
                    }}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!content && !selectedOption}
                >
                  Enviar Resposta
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
