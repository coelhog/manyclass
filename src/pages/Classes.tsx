import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Search, Users, Clock, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { classService } from '@/services/classService'
import { ClassGroup, BillingModel, ClassCategory } from '@/types'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const DAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
]

const COLORS = [
  { label: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { label: 'Verde', value: 'green', class: 'bg-green-500' },
  { label: 'Vermelho', value: 'red', class: 'bg-red-500' },
  { label: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
  { label: 'Roxo', value: 'purple', class: 'bg-purple-500' },
  { label: 'Laranja', value: 'orange', class: 'bg-orange-500' },
]

export default function Classes() {
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('individual')
  const [newClass, setNewClass] = useState<{
    name: string
    days: number[]
    startTime: string
    duration: number
    billingModel: BillingModel
    price: number
    category: ClassCategory
    studentLimit?: number
    color: string
  }>({
    name: '',
    days: [],
    startTime: '09:00',
    duration: 60,
    billingModel: 'per_student',
    price: 0,
    category: 'individual',
    studentLimit: 1,
    color: 'blue',
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
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar turmas',
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
    if (newClass.days.length === 0) {
      toast({ variant: 'destructive', title: 'Selecione pelo menos um dia' })
      return
    }

    const daysStr = newClass.days
      .sort()
      .map((d) => DAYS.find((day) => day.value === d)?.label)
      .join('/')
    const scheduleStr = `${daysStr} ${newClass.startTime}`

    try {
      await classService.createClass({
        ...newClass,
        schedule: scheduleStr,
        status: 'active',
        studentIds: [],
      })
      toast({ title: 'Turma criada com sucesso!' })
      setIsDialogOpen(false)
      loadClasses()
      setNewClass({
        name: '',
        days: [],
        startTime: '09:00',
        duration: 60,
        billingModel: 'per_student',
        price: 0,
        category: 'individual',
        studentLimit: 1,
        color: 'blue',
      })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar turma' })
    }
  }

  const filteredClasses = classes.filter((c) => c.category === activeTab)

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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nova Turma</DialogTitle>
              <DialogDescription>
                Configure os detalhes da nova turma.
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
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <Select
                  value={newClass.category}
                  onValueChange={(v) =>
                    setNewClass({
                      ...newClass,
                      category: v as ClassCategory,
                      billingModel: 'per_student',
                      studentLimit: v === 'individual' ? 1 : 10,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Aluno Individual</SelectItem>
                    <SelectItem value="group">Grupo</SelectItem>
                    <SelectItem value="class">Turma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newClass.category !== 'individual' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="limit" className="text-right">
                    Limite de Alunos
                  </Label>
                  <Input
                    id="limit"
                    type="number"
                    className="col-span-3"
                    value={newClass.studentLimit}
                    onChange={(e) =>
                      setNewClass({
                        ...newClass,
                        studentLimit: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dias</Label>
                <div className="col-span-3">
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={newClass.days.map(String)}
                    onValueChange={(val) =>
                      setNewClass({
                        ...newClass,
                        days: val.map(Number),
                      })
                    }
                    className="justify-start"
                  >
                    {DAYS.map((day) => (
                      <ToggleGroupItem
                        key={day.value}
                        value={String(day.value)}
                        className="h-8 w-8 p-0"
                      >
                        {day.label.charAt(0)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Horário
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="time"
                    type="time"
                    value={newClass.startTime}
                    onChange={(e) =>
                      setNewClass({ ...newClass, startTime: e.target.value })
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newClass.duration}
                      onChange={(e) =>
                        setNewClass({
                          ...newClass,
                          duration: Number(e.target.value),
                        })
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Cor</Label>
                <Select
                  value={newClass.color}
                  onValueChange={(v) => setNewClass({ ...newClass, color: v })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${color.class}`}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar turmas..." className="pl-8" />
          </div>
        </div>

        <Tabs
          defaultValue="individual"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="individual">Aluno Individual</TabsTrigger>
            <TabsTrigger value="group">Grupo</TabsTrigger>
            <TabsTrigger value="class">Turma</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
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
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {cls.category === 'individual'
                      ? 'Individual'
                      : cls.category === 'group'
                        ? 'Grupo'
                        : 'Turma'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {cls.studentIds.length} / {cls.studentLimit || '∞'} Alunos
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {cls.schedule} ({cls.duration} min)
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
          {filteredClasses.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Nenhuma turma encontrada nesta categoria.
            </div>
          )}
        </div>
      )}
    </PageTransition>
  )
}
