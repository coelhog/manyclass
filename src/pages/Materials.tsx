import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Search, FileText, Download, Eye, Trash2 } from 'lucide-react'
import { PageTransition } from '@/components/PageTransition'
import { CardGridSkeleton } from '@/components/skeletons'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { materialService } from '@/services/materialService'
import { studentService } from '@/services/studentService'
import { Material, Student } from '@/types'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Materials() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    studentIds: [] as string[],
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (user?.role === 'student') {
        const data = await materialService.getByStudentId(user.id)
        setMaterials(data)
      } else {
        const [mats, studs] = await Promise.all([
          materialService.getAll(),
          studentService.getAll(),
        ])
        setMaterials(mats)
        setStudents(studs)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newMaterial.title) {
      toast({ variant: 'destructive', title: 'Título é obrigatório' })
      return
    }
    try {
      await materialService.create({
        ...newMaterial,
        fileUrl: '#',
        fileType: 'PDF',
        studentIds:
          newMaterial.studentIds.length > 0
            ? newMaterial.studentIds
            : students.map((s) => s.id), // Default to all if none selected
      })
      toast({ title: 'Material enviado com sucesso!' })
      setIsDialogOpen(false)
      setNewMaterial({ title: '', description: '', studentIds: [] })
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao enviar material' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este material?')) {
      await materialService.delete(id)
      loadData()
    }
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Materiais</h1>
        {user?.role === 'teacher' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-sm hover:shadow-md transition-all">
                <Plus className="mr-2 h-4 w-4" /> Upload de Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newMaterial.title}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={newMaterial.description}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Enviar para (Opcional - Padrão: Todos)</Label>
                  <ScrollArea className="h-[150px] border rounded-md p-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={newMaterial.studentIds.includes(student.id)}
                          onCheckedChange={(checked) => {
                            if (checked)
                              setNewMaterial((prev) => ({
                                ...prev,
                                studentIds: [...prev.studentIds, student.id],
                              }))
                            else
                              setNewMaterial((prev) => ({
                                ...prev,
                                studentIds: prev.studentIds.filter(
                                  (id) => id !== student.id,
                                ),
                              }))
                          }}
                        />
                        <Label
                          htmlFor={`student-${student.id}`}
                          className="cursor-pointer"
                        >
                          {student.name}
                        </Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Enviar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar materiais..." className="pl-8" />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {materials.map((material) => (
            <Card
              key={material.id}
              className="group hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="bg-muted p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                  <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {user?.role === 'teacher' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => handleDelete(material.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-base line-clamp-1">
                  {material.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {material.fileType} •{' '}
                  {new Date(material.uploadedAt).toLocaleDateString()}
                </p>
                {user?.role === 'teacher' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Enviado para: {material.studentIds.length} alunos
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Visualizar"
                  className="hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Baixar"
                  className="hover:text-primary"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          {materials.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              Nenhum material encontrado.
            </div>
          )}
        </div>
      )}
    </PageTransition>
  )
}
