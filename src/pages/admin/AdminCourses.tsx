import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { courseService } from '@/services/courseService'
import { PlatformCourse } from '@/types'
import { Plus, Trash2, Video, Edit } from 'lucide-react'
import { CardGridSkeleton } from '@/components/skeletons'
import { CourseDialog } from '@/components/admin/CourseDialog'

export default function AdminCourses() {
  const [courses, setCourses] = useState<PlatformCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<
    PlatformCourse | undefined
  >(undefined)
  const { toast } = useToast()

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    setIsLoading(true)
    try {
      const data = await courseService.getAll()
      setCourses(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingCourse(undefined)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (course: PlatformCourse) => {
    setEditingCourse(course)
    setIsDialogOpen(true)
  }

  const handleSave = async (courseData: Partial<PlatformCourse>) => {
    if (!courseData.title || !courseData.videoUrl) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }

    try {
      if (editingCourse && courseData.id) {
        await courseService.update(courseData.id, courseData)
        toast({ title: 'Curso atualizado com sucesso!' })
      } else {
        await courseService.create(
          courseData as Omit<PlatformCourse, 'id' | 'createdAt'>,
        )
        toast({ title: 'Curso criado com sucesso!' })
      }
      setIsDialogOpen(false)
      loadCourses()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar curso' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await courseService.delete(id)
        toast({ title: 'Curso excluído' })
        loadCourses()
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao excluir' })
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cursos da Plataforma
          </h1>
          <p className="text-muted-foreground">
            Gerencie os conteúdos disponibilizados para os professores.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Curso
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={course.isActive ? '' : 'opacity-70'}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle
                    className="text-lg line-clamp-1"
                    title={course.title}
                  >
                    {course.title}
                  </CardTitle>
                  <Video className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription className="line-clamp-2 h-10">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  <Video className="h-10 w-10 text-muted-foreground/50" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Nenhum curso cadastrado.
            </div>
          )}
        </div>
      )}

      <CourseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        initialData={editingCourse}
      />
    </div>
  )
}
