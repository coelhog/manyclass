import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { classService } from '@/services/classService'
import { studentService } from '@/services/studentService'
import { ClassGroup, Student } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>()
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    if (!id) return
    const cls = await classService.getClassById(id)
    if (cls) {
      setClassGroup(cls)
      const all = await studentService.getAll()
      setAllStudents(all)
      setStudents(all.filter((s) => cls.studentIds.includes(s.id)))
    }
  }

  const handleAddStudents = async () => {
    if (!classGroup || !id) return
    try {
      const updatedIds = [
        ...new Set([...classGroup.studentIds, ...selectedStudents]),
      ]
      await classService.updateClass(id, { studentIds: updatedIds })
      toast({ title: 'Alunos adicionados com sucesso!' })
      setIsAddStudentOpen(false)
      setSelectedStudents([])
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao adicionar alunos' })
    }
  }

  const handleRemoveStudent = async (studentId: string) => {
    if (!classGroup || !id) return
    if (confirm('Remover aluno desta turma?')) {
      try {
        const updatedIds = classGroup.studentIds.filter(
          (sid) => sid !== studentId,
        )
        await classService.updateClass(id, { studentIds: updatedIds })
        toast({ title: 'Aluno removido com sucesso!' })
        loadData()
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao remover aluno' })
      }
    }
  }

  if (!classGroup) return <div>Carregando...</div>

  const availableStudents = allStudents.filter(
    (s) => !classGroup.studentIds.includes(s.id),
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/classes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {classGroup.name}
          </h1>
          <p className="text-muted-foreground">{classGroup.schedule}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alunos Matriculados ({students.length})</CardTitle>
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Alunos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Alunos à Turma</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {availableStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => {
                          if (checked)
                            setSelectedStudents([
                              ...selectedStudents,
                              student.id,
                            ])
                          else
                            setSelectedStudents(
                              selectedStudents.filter(
                                (id) => id !== student.id,
                              ),
                            )
                        }}
                      />
                      <Label
                        htmlFor={student.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        {student.name}
                      </Label>
                    </div>
                  ))}
                  {availableStudents.length === 0 && (
                    <p className="text-muted-foreground text-center">
                      Todos os alunos já estão nesta turma.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <Button
                onClick={handleAddStudents}
                disabled={selectedStudents.length === 0}
              >
                Confirmar
              </Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => handleRemoveStudent(student.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Nenhum aluno matriculado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
