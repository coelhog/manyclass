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
import { ClassGroup } from '@/types'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { PageTransition } from '@/components/PageTransition'
import { CardGridSkeleton } from '@/components/skeletons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { ClassDialog } from '@/components/classes/ClassDialog'
import { DAYS } from '@/lib/constants'

export default function Classes() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editClass, setEditClass] = useState<ClassGroup | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const loadClasses = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await classService.getByTeacherId(user.id)
      setClasses(Array.isArray(data) ? data : [])
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar turmas',
      })
      setClasses([])
    } finally {
      setIsLoading(false)
    }
  }, [toast, user])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  const handleOpenCreate = () => {
    setEditClass(undefined)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (cls: ClassGroup) => {
    setEditClass(cls)
    setIsDialogOpen(true)
  }

  const handleSave = async (data: any) => {
    if (!user) return
    setIsSaving(true)

    const daysStr = data.days
      .sort()
      .map((d: number) => DAYS.find((day) => day.value === d)?.label)
      .join('/')
    const scheduleStr = `${daysStr} ${data.startTime}`

    const commonData = {
      name: data.name,
      days: data.days,
      startTime: data.startTime,
      duration: data.duration,
      billingModel: data.billingModel,
      price: data.price,
      category: data.category,
      studentLimit: data.studentLimit,
      color: data.color,
      teacherId: user.id,
      schedule: scheduleStr,
      status: 'active' as const,
      meetLink: data.meetLink,
    }

    try {
      if (editClass) {
        await classService.updateClass(
          editClass.id,
          {
            ...commonData,
            studentIds: editClass.studentIds,
          },
          { syncGoogle: data.syncGoogle },
        )
        toast({ title: 'Turma atualizada com sucesso!' })
      } else {
        await classService.createClass(
          { ...commonData, studentIds: [] },
          {
            syncGoogle: data.syncGoogle,
            generateMeet: data.generateMeet,
          },
        )
        toast({ title: 'Turma criada com sucesso!' })
      }
      setIsDialogOpen(false)
      loadClasses()
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: editClass ? 'Erro ao atualizar turma' : 'Erro ao criar turma',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredClasses =
    activeTab === 'all'
      ? classes
      : classes.filter((c) => c.category === activeTab)

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
        <Button
          className="shadow-sm hover:shadow-md transition-all"
          onClick={handleOpenCreate}
        >
          <Plus className="mr-2 h-4 w-4" /> Criar Turma
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar turmas..." className="pl-8" />
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
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
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleOpenEdit(cls)}
                >
                  Gerenciar
                </Button>
                <Button className="flex-1" asChild>
                  <Link to={`/classes/${cls.id}`}>Detalhes</Link>
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

      <ClassDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        initialData={editClass}
        isSaving={isSaving}
      />
    </PageTransition>
  )
}
