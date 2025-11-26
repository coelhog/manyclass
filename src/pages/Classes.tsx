import { useState, useEffect, useCallback } from 'react'
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
import { Plus, Search, Users, Clock, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { classService } from '@/services/classService'
import { ClassGroup, BillingModel } from '@/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { PageTransition } from '@/components/PageTransition'
import { CardGridSkeleton } from '@/components/skeletons'

export default function Classes() {
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newClass, setNewClass] = useState<{
    name: string
    schedule: string
    billingModel: BillingModel
    price: number
  }>({
    name: '',
    schedule: '',
    billingModel: 'per_student',
    price: 0,
  })
  const { toast } = useToast()

  const loadClasses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await classService.getAllClasses()
      if (Array.isArray(data)) {
        setClasses(data)
      } else {
        setClasses([])
        console.error('Invalid classes data received', data)
      }
    } catch (error) {
      console.error('Failed to load classes', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar turmas',
        description: 'Por favor, tente recarregar a página.',
      })
      setClasses([])
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  const handleCreate = async () => {
    if (!newClass.name) {
      toast({ variant: 'destructive', title: 'Nome da turma é obrigatório' })
      return
    }
    try {
      await classService.createClass({
        ...newClass,
        status: 'active',
        studentIds: [],
      })
      toast({ title: 'Turma criada com sucesso!' })
      setIsDialogOpen(false)
      loadClasses()
      setNewClass({
        name: '',
        schedule: '',
        billingModel: 'per_student',
        price: 0,
      })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar turma' })
    }
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm hover:shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> Criar Turma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Turma</DialogTitle>
              <DialogDescription>
                Crie uma nova turma e defina o modelo de cobrança.
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billing" className="text-right">
                  Cobrança
                </Label>
                <Select
                  value={newClass.billingModel}
                  onValueChange={(v) =>
                    setNewClass({
                      ...newClass,
                      billingModel: v as BillingModel,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_student">
                      Por Aluno (Mensalidade)
                    </SelectItem>
                    <SelectItem value="per_class">
                      Por Turma (Valor Fixo)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Preço (R$)
                </Label>
                <Input
                  id="price"
                  type="number"
                  className="col-span-3"
                  value={newClass.price}
                  onChange={(e) =>
                    setNewClass({ ...newClass, price: Number(e.target.value) })
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

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{cls.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      cls.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : ''
                    }
                  >
                    {cls.status}
                  </Badge>
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
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {cls.billingModel === 'per_student'
                      ? 'Por Aluno'
                      : 'Por Turma'}{' '}
                    - R$ {cls.price.toFixed(2)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/classes/${cls.id}`}>Ver Detalhes</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to={`/classes/${cls.id}`}>Gerenciar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Nenhuma turma encontrada.
            </div>
          )}
        </div>
      )}
    </PageTransition>
  )
}
