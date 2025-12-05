import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  Users,
  Loader2,
} from 'lucide-react'
import { PageTransition } from '@/components/PageTransition'
import { CardGridSkeleton } from '@/components/skeletons'
import { useState, useEffect, useCallback } from 'react'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MaterialDialog } from '@/components/materials/MaterialDialog'

export default function Materials() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditAccessOpen, setIsEditAccessOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  )
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      if (user?.role === 'student') {
        const data = await materialService.getByStudentId(user.id)
        setMaterials(data)
      } else if (user?.role === 'teacher') {
        const [mats, studs] = await Promise.all([
          materialService.getByTeacherId(user.id),
          studentService.getAll(),
        ])
        setMaterials(mats)
        setStudents(studs)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = async (data: any, file: File | null) => {
    if (!data.title) {
      toast({ variant: 'destructive', title: 'Título é obrigatório' })
      return
    }
    if (!file) {
      toast({ variant: 'destructive', title: 'Selecione um arquivo' })
      return
    }

    setIsUploading(true)
    try {
      const fileType = file.name.endsWith('.pdf') ? 'PDF' : 'Outro'

      await materialService.create({
        ...data,
        file: file,
        fileType,
        studentIds:
          data.studentIds.length > 0
            ? data.studentIds
            : students.map((s) => s.id),
        teacherId: user?.id,
      })
      toast({ title: 'Material enviado com sucesso!' })
      setIsDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar material',
        description:
          error.message || 'Verifique sua conexão e tente novamente.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este material?')) {
      await materialService.delete(id)
      loadData()
    }
  }

  const openEditAccess = (material: Material) => {
    setSelectedMaterial(material)
    setSelectedStudentIds(material.studentIds)
    setIsEditAccessOpen(true)
  }

  const handleSaveAccess = async () => {
    if (!selectedMaterial) return
    try {
      await materialService.update(selectedMaterial.id, {
        studentIds: selectedStudentIds,
      })
      toast({ title: 'Acesso atualizado com sucesso!' })
      setIsEditAccessOpen(false)
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar acesso' })
    }
  }

  const handleView = (material: Material) => {
    setSelectedMaterial(material)
    setIsViewOpen(true)
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Materiais</h1>
        {user?.role === 'teacher' && (
          <Button
            className="shadow-sm hover:shadow-md transition-all"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Upload de Material
          </Button>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              {selectedMaterial?.fileType === 'PDF' ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              {selectedMaterial?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
            {selectedMaterial?.fileType === 'PDF' &&
            selectedMaterial.fileUrl ? (
              <iframe
                src={selectedMaterial.fileUrl}
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 p-8">
                <FileText className="h-16 w-16 opacity-20" />
                <p className="text-lg font-medium">
                  Visualização não disponível para este formato.
                </p>
                {selectedMaterial?.fileUrl && (
                  <Button asChild size="lg">
                    <a
                      href={selectedMaterial.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Baixar Arquivo
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Access Dialog */}
      <Dialog open={isEditAccessOpen} onOpenChange={setIsEditAccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Acesso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selecione os alunos com acesso:</Label>
              <ScrollArea className="h-[250px] border rounded-md p-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center space-x-2 py-1"
                  >
                    <Checkbox
                      id={`edit-student-${student.id}`}
                      checked={selectedStudentIds.includes(student.id)}
                      onCheckedChange={(checked) => {
                        if (checked)
                          setSelectedStudentIds((prev) => [...prev, student.id])
                        else
                          setSelectedStudentIds((prev) =>
                            prev.filter((id) => id !== student.id),
                          )
                      }}
                    />
                    <Label
                      htmlFor={`edit-student-${student.id}`}
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
            <Button onClick={handleSaveAccess}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              className="group hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="bg-muted p-2 rounded-md group-hover:bg-primary/10 transition-colors">
                  <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {user?.role === 'teacher' && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={() => openEditAccess(material)}
                      title="Gerenciar Acesso"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDelete(material.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <CardTitle className="text-base line-clamp-1">
                  {material.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {material.fileType} •{' '}
                  {new Date(material.uploadedAt).toLocaleDateString()}
                </p>
                {material.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {material.description}
                  </p>
                )}
                {user?.role === 'teacher' && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-1 rounded w-fit">
                    Acesso: {material.studentIds.length} alunos
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-3 bg-muted/5">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Visualizar"
                  className="flex-1 hover:text-primary gap-2"
                  onClick={() => handleView(material)}
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Baixar"
                  className="hover:text-primary"
                  asChild
                >
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {materials.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Nenhum material encontrado.</p>
              <p className="text-sm">
                Faça upload de PDFs ou documentos para seus alunos.
              </p>
            </div>
          )}
        </div>
      )}

      <MaterialDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleCreate}
        students={students}
        isUploading={isUploading}
      />
    </PageTransition>
  )
}
