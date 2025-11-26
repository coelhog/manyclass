import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Search, Users, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { classService } from '@/services/classService'
import { ClassGroup } from '@/types'
import { Link } from 'react-router-dom'
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
import { useToast } from '@/hooks/use-toast'

export default function Classes() {
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', schedule: '' })
  const { toast } = useToast()

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    setIsLoading(true)
    try {
      const data = await classService.getAllClasses()
      setClasses(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await classService.createClass({
        ...newClass,
        status: 'active',
        studentIds: [],
      })
      toast({ title: 'Turma criada com sucesso!' })
      setIsDialogOpen(false)
      loadClasses()
      setNewClass({ name: '', schedule: '' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar turma' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Criar Turma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Turma</DialogTitle>
              <DialogDescription>
                Crie uma nova turma para adicionar alunos.
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
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="schedule" className="text-right">
                  Horário
                </Label>
                <Input
                  id="schedule"
                  className="col-span-3"
                  placeholder="Ex: Seg/Qua 19:00"
                  value={newClass.schedule}
                  onChange={(e) =>
                    setNewClass({ ...newClass, schedule: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar turmas..." className="pl-8" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{cls.name}</CardTitle>
                  <Badge variant="outline">{cls.status}</Badge>
                </div>
                <CardDescription>ID: {cls.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {cls.studentIds.length} Alunos matriculados
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {cls.schedule}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to={`/classes/${cls.id}`}>Ver Detalhes</Link>
                </Button>
                <Button asChild>
                  <Link to={`/classes/${cls.id}`}>Gerenciar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
