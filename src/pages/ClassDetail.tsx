import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { classService } from '@/services/classService'
import { studentService } from '@/services/studentService'
import { ClassGroup, Student } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
  Share2,
  Copy,
  Clock,
  Link as LinkIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { PageTransition } from '@/components/PageTransition'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>()
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState<{
    studentId: string
    price: number
  } | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const cls = await classService.getClassById(id)
      if (cls) {
        setClassGroup(cls)
        const all = await studentService.getAll()
        setAllStudents(all)
        setStudents(all.filter((s) => cls.studentIds.includes(s.id)))
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddStudents = async () => {
    if (!classGroup || !id) return

    // Check limits
    const currentCount = classGroup.studentIds.length
    const toAddCount = selectedStudents.length
    const limit = classGroup.studentLimit || 999

    if (currentCount + toAddCount > limit) {
      toast({
        variant: 'destructive',
        title: `Limite de alunos excedido. Máximo: ${limit}`,
      })
      return
    }

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

  const handleUpdatePrice = async () => {
    if (!editingPrice || !id) return
    try {
      await classService.updateStudentPrice(
        id,
        editingPrice.studentId,
        editingPrice.price,
      )
      toast({ title: 'Preço atualizado!' })
      setEditingPrice(null)
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar preço' })
    }
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copiado!', description: message })
  }

  const handleShareLink = (days?: number) => {
    if (!classGroup?.meetLink) {
      toast({
        variant: 'destructive',
        title: 'Esta turma não possui link de reunião configurado.',
      })
      return
    }

    let textToCopy = `Link da aula: ${classGroup.meetLink}`
    let message = 'Link copiado para a área de transferência.'

    if (days) {
      textToCopy += `\nEste link é válido por ${days} dias (sugestão).`
      message = `Link com sugestão de ${days} dias copiado.`
    }

    copyToClipboard(textToCopy, message)
  }

  if (isLoading) {
    return (
      <PageTransition className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </PageTransition>
    )
  }

  if (!classGroup) return <div>Turma não encontrada</div>

  const availableStudents = allStudents.filter(
    (s) => !classGroup.studentIds.includes(s.id),
  )

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hover:bg-muted/50"
        >
          <Link to="/classes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {classGroup.name}
          </h1>
          <p className="text-muted-foreground">
            {classGroup.schedule} •{' '}
            {classGroup.category === 'individual' ? 'Individual' : 'Grupo'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar Link
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Opções de Compartilhamento</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleShareLink()}
              className="cursor-pointer"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Copiar Link Direto
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleShareLink(7)}
              className="cursor-pointer"
            >
              <Clock className="mr-2 h-4 w-4" />
              Sugestão de 7 dias
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleShareLink(30)}
              className="cursor-pointer"
            >
              <Clock className="mr-2 h-4 w-4" />
              Sugestão de 30 dias
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Alunos Matriculados ({students.length} /{' '}
            {classGroup.studentLimit || '∞'})
          </CardTitle>
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="shadow-sm hover:shadow-md transition-all"
                disabled={
                  classGroup.studentIds.length >=
                  (classGroup.studentLimit || 999)
                }
              >
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
                      className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md transition-colors"
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
                        className="flex items-center gap-2 cursor-pointer flex-1"
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
                className="w-full"
              >
                Confirmar
              </Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => {
              const customPrice = classGroup.customStudentPrices?.[student.id]
              const currentPrice = customPrice ?? classGroup.price

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="transition-transform group-hover:scale-110">
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

                  <div className="flex items-center gap-4">
                    {classGroup.category === 'group' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          R$ {currentPrice.toFixed(2)}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                setEditingPrice({
                                  studentId: student.id,
                                  price: currentPrice,
                                })
                              }
                            >
                              <DollarSign className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Ajustar Valor para {student.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <Label>Novo Valor Mensal</Label>
                              <Input
                                type="number"
                                value={editingPrice?.price || 0}
                                onChange={(e) =>
                                  setEditingPrice((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          price: Number(e.target.value),
                                        }
                                      : null,
                                  )
                                }
                                className="mt-2"
                              />
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdatePrice}>
                                Salvar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveStudent(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
            {students.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Nenhum aluno matriculado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
