import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Upload,
  FileDown,
  UserPlus,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { studentService } from '@/services/studentService'
import { classService } from '@/services/classService'
import { Student } from '@/types'
import { Link } from 'react-router-dom'
import { PageTransition } from '@/components/PageTransition'
import { TableSkeleton } from '@/components/skeletons'
import { useAuth } from '@/contexts/AuthContext'
import { StudentDialog } from '@/components/students/StudentDialog'
import { BulkStudentDialog } from '@/components/students/BulkStudentDialog'

export default function Students() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [createdStudent, setCreatedStudent] = useState<{
    email: string
    password?: string
  } | null>(null)
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false)

  const { toast } = useToast()

  const loadStudents = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await studentService.getByTeacherId(user.id)
      setStudents(data)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar alunos' })
    } finally {
      setIsLoading(false)
    }
  }, [toast, user])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = async (studentData: any) => {
    if (!studentData.name || !studentData.email) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }
    if (!user) return

    setIsCreating(true)
    // Auto-generate password if not provided
    const password =
      studentData.password || Math.random().toString(36).slice(-8)

    try {
      const created = await studentService.create({
        ...studentData,
        teacherId: user.id,
        password,
        status: 'active',
        avatar: `https://img.usecurling.com/i?q=user&color=gray&shape=fill`,
        joinedAt: new Date().toISOString(),
      })

      setStudents((prev) => [...prev, created])
      setCreatedStudent({
        email: studentData.email,
        password: password,
      })

      setIsDialogOpen(false)
      setIsCredentialsOpen(true)

      toast({ title: 'Aluno criado com sucesso!' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar aluno',
        description: error.message,
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copiado para a área de transferência' })
  }

  const handleBulkCreate = async (validStudents: any[]) => {
    if (validStudents.filter((s) => s.name).length === 0) {
      toast({
        variant: 'destructive',
        title: 'Adicione pelo menos um aluno válido',
      })
      return
    }
    if (!user) return

    setIsCreating(true)
    try {
      const studentsToCreate = validStudents
        .filter((s) => s.name)
        .map((s) => ({
          teacherId: user.id,
          name: s.name,
          email:
            s.email || `${s.name.toLowerCase().replace(/\s/g, '.')}@email.com`,
          phone: '',
          level: s.group || 'A1',
          status: 'active' as const,
          avatar: `https://img.usecurling.com/i?q=user&color=gray&shape=fill`,
          joinedAt: new Date().toISOString().split('T')[0],
          password: Math.random().toString(36).slice(-8),
        }))

      const createdStudentsData =
        await studentService.createBulk(studentsToCreate)

      // Update state directly for immediate feedback
      setStudents((prev) => [...prev, ...createdStudentsData])

      // Handle Class Associations
      const classes = await classService.getAllClasses()
      const studentsByGroup = validStudents.reduce(
        (acc, curr, idx) => {
          if (curr.groupName && createdStudentsData[idx]) {
            if (!acc[curr.groupName]) acc[curr.groupName] = []
            acc[curr.groupName].push(createdStudentsData[idx].id)
          }
          return acc
        },
        {} as Record<string, string[]>,
      )

      for (const [groupName, studentIds] of Object.entries(studentsByGroup)) {
        const existingClass = classes.find(
          (c) => c.name.toLowerCase() === groupName.toLowerCase(),
        )

        if (existingClass) {
          await classService.updateClass(existingClass.id, {
            studentIds: [...existingClass.studentIds, ...studentIds],
          })
        } else {
          await classService.createClass({
            name: groupName,
            teacherId: user.id,
            days: [],
            startTime: '09:00',
            duration: 60,
            status: 'active',
            studentIds: studentIds,
            billingModel: 'per_student',
            price: 0,
            category: 'group',
            color: 'blue',
          })
        }
      }

      toast({
        title: `${validStudents.filter((s) => s.name).length} alunos adicionados com sucesso!`,
      })
      setIsBulkDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast({ variant: 'destructive', title: 'Erro ao adicionar alunos' })
    } finally {
      setIsCreating(false)
    }
  }

  const handleImport = async () => {
    if (!user) return
    toast({ title: 'Importando alunos...' })
    setIsCreating(true)
    setTimeout(async () => {
      try {
        const mockImported = [
          {
            teacherId: user.id,
            name: 'Importado 1',
            email: 'imp1@test.com',
            phone: '1199999999',
            level: 'A1',
            status: 'active' as const,
            avatar: '',
            joinedAt: new Date().toISOString(),
            password: Math.random().toString(36).slice(-8),
          },
        ]
        const created = await studentService.createBulk(mockImported)
        setStudents((prev) => [...prev, ...created])
        toast({ title: 'Arquivo processado com sucesso!' })
        setIsImportDialogOpen(false)
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro na importação' })
      } finally {
        setIsCreating(false)
      }
    }, 1500)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        await studentService.delete(id)
        setStudents(students.filter((s) => s.id !== id))
        toast({ title: 'Aluno removido com sucesso' })
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao remover aluno' })
      }
    }
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
        <div className="flex gap-2">
          <Dialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-sm">
                <Upload className="mr-2 h-4 w-4" /> Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Alunos</DialogTitle>
                <DialogDescription>
                  Faça upload de um arquivo CSV ou Excel para importar alunos em
                  massa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast({ title: 'Template baixado!' })}
                >
                  <FileDown className="mr-2 h-4 w-4" /> Baixar Modelo
                </Button>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique ou arraste o arquivo aqui
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleImport} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Processar Arquivo'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="shadow-sm"
            onClick={() => setIsBulkDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Adicionar Vários Alunos
          </Button>

          <Button
            className="shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Aluno
          </Button>

          {/* Credentials Display Dialog */}
          <Dialog open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" /> Conta Criada com Sucesso
                </DialogTitle>
                <DialogDescription>
                  Envie estas credenciais para o aluno acessar a plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-muted p-4 rounded-lg space-y-3 my-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded border flex-1">
                      {createdStudent?.email}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() =>
                        copyToClipboard(createdStudent?.email || '')
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Senha</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded border flex-1 font-mono">
                      {createdStudent?.password}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() =>
                        copyToClipboard(createdStudent?.password || '')
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsCredentialsOpen(false)}>
                  Concluído
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
            className="pl-8 transition-all focus:w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : (
        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <Avatar className="transition-transform group-hover:scale-110">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to={`/students/${student.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {student.name}
                    </Link>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to={`/students/${student.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer focus:text-destructive"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <StudentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleCreate}
        isSaving={isCreating}
      />

      <BulkStudentDialog
        isOpen={isBulkDialogOpen}
        onClose={() => setIsBulkDialogOpen(false)}
        onSave={handleBulkCreate}
        isSaving={isCreating}
      />
    </PageTransition>
  )
}
