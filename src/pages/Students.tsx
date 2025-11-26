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
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    level: 'A1',
  })

  // Updated bulk structure to match user story: Name, Group (level/code), Group Name (Class Name)
  const [bulkStudents, setBulkStudents] = useState([
    { name: '', email: '', group: '', groupName: '' },
  ])

  const { toast } = useToast()

  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await studentService.getAll()
      setStudents(data)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar alunos' })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = async () => {
    if (!newStudent.name || !newStudent.email) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }
    try {
      await studentService.create({
        ...newStudent,
        status: 'active',
        avatar: `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${Math.random()}`,
        joinedAt: new Date().toISOString().split('T')[0],
      })
      toast({ title: 'Aluno adicionado com sucesso!' })
      setIsDialogOpen(false)
      loadStudents()
      setNewStudent({ name: '', email: '', phone: '', level: 'A1' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar aluno' })
    }
  }

  const handleBulkCreate = async () => {
    const validStudents = bulkStudents.filter((s) => s.name)
    if (validStudents.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Adicione pelo menos um aluno válido',
      })
      return
    }

    try {
      // 1. Create Students
      const studentsToCreate = validStudents.map((s) => ({
        name: s.name,
        email:
          s.email || `${s.name.toLowerCase().replace(/\s/g, '.')}@email.com`, // Auto-generate email if missing
        phone: '',
        level: s.group || 'A1', // Map 'grupo' to level
        status: 'active' as const,
        avatar: `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${Math.random()}`,
        joinedAt: new Date().toISOString().split('T')[0],
      }))

      const createdStudents = await studentService.createBulk(studentsToCreate)

      // 2. Handle Group Association (Class)
      const classes = await classService.getAllClasses()
      const studentsByGroup = validStudents.reduce(
        (acc, curr, idx) => {
          if (curr.groupName) {
            if (!acc[curr.groupName]) acc[curr.groupName] = []
            acc[curr.groupName].push(createdStudents[idx].id)
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
          // Create new class if it doesn't exist
          await classService.createClass({
            name: groupName,
            schedule: 'A definir',
            status: 'active',
            studentIds: studentIds,
            billingModel: 'per_student',
            price: 0,
          })
        }
      }

      toast({
        title: `${validStudents.length} alunos adicionados com sucesso!`,
      })
      setIsBulkDialogOpen(false)
      setBulkStudents([{ name: '', email: '', group: '', groupName: '' }])
      loadStudents()
    } catch (error) {
      console.error(error)
      toast({ variant: 'destructive', title: 'Erro ao adicionar alunos' })
    }
  }

  const handleImport = async () => {
    toast({ title: 'Importando alunos...' })
    setTimeout(async () => {
      try {
        const mockImported = [
          {
            name: 'Importado 1',
            email: 'imp1@test.com',
            phone: '1199999999',
            level: 'A1',
            status: 'active' as const,
            avatar: '',
            joinedAt: new Date().toISOString(),
          },
        ]
        await studentService.createBulk(mockImported)
        toast({ title: 'Arquivo processado com sucesso!' })
        setIsImportDialogOpen(false)
        loadStudents()
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro na importação' })
      }
    }, 1500)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        await studentService.delete(id)
        toast({ title: 'Aluno removido com sucesso' })
        loadStudents()
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao remover aluno' })
      }
    }
  }

  const addBulkRow = () => {
    setBulkStudents([
      ...bulkStudents,
      { name: '', email: '', group: '', groupName: '' },
    ])
  }

  const updateBulkRow = (index: number, field: string, value: string) => {
    const newBulk = [...bulkStudents]
    newBulk[index] = { ...newBulk[index], [field]: value }
    setBulkStudents(newBulk)
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
                <Button onClick={handleImport}>Processar Arquivo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-sm">
                <UserPlus className="mr-2 h-4 w-4" /> Adicionar Vários Alunos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Adicionar Múltiplos Alunos</DialogTitle>
                <DialogDescription>
                  Preencha os dados dos alunos abaixo. Se o "Nome do Grupo" for
                  informado, o aluno será adicionado à turma correspondente.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground mb-2">
                    <div>Nome do Aluno</div>
                    <div>Email (Opcional)</div>
                    <div>Grupo (Nível)</div>
                    <div>Nome do Grupo (Turma)</div>
                  </div>
                  {bulkStudents.map((student, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-4 items-center border-b pb-4"
                    >
                      <Input
                        placeholder="Nome"
                        value={student.name}
                        onChange={(e) =>
                          updateBulkRow(index, 'name', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Email"
                        value={student.email}
                        onChange={(e) =>
                          updateBulkRow(index, 'email', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Ex: A1"
                        value={student.group}
                        onChange={(e) =>
                          updateBulkRow(index, 'group', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Ex: Inglês Básico"
                        value={student.groupName}
                        onChange={(e) =>
                          updateBulkRow(index, 'groupName', e.target.value)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={addBulkRow}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Linha
                  </Button>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button onClick={handleBulkCreate}>Salvar Todos</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-sm hover:shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4" /> Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                <DialogDescription>
                  Preencha os dados do aluno para adicioná-lo ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    className="col-span-3"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    className="col-span-3"
                    value={newStudent.phone}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="level" className="text-right">
                    Nível
                  </Label>
                  <Input
                    id="level"
                    className="col-span-3"
                    value={newStudent.level}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, level: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreate}>
                  Salvar
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
    </PageTransition>
  )
}
