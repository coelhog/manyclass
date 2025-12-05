import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { PlatformCourse } from '@/types'

interface CourseDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (course: Partial<PlatformCourse>) => Promise<void>
  initialData?: Partial<PlatformCourse>
}

export function CourseDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CourseDialogProps) {
  const [currentCourse, setCurrentCourse] = useState<Partial<PlatformCourse>>({
    title: '',
    description: '',
    videoUrl: '',
    isActive: true,
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCurrentCourse(initialData)
      } else {
        setCurrentCourse({
          title: '',
          description: '',
          videoUrl: '',
          isActive: true,
        })
      }
    }
  }, [isOpen, initialData])

  const handleSave = () => {
    onSave(currentCourse)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar Curso' : 'Novo Curso'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do vídeo/aula.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={currentCourse.title}
              onChange={(e) =>
                setCurrentCourse({ ...currentCourse, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={currentCourse.description}
              onChange={(e) =>
                setCurrentCourse({
                  ...currentCourse,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="videoUrl">URL do Vídeo</Label>
            <Input
              id="videoUrl"
              placeholder="https://..."
              value={currentCourse.videoUrl}
              onChange={(e) =>
                setCurrentCourse({
                  ...currentCourse,
                  videoUrl: e.target.value,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Ativo</Label>
            <Switch
              id="active"
              checked={currentCourse.isActive}
              onCheckedChange={(checked) =>
                setCurrentCourse({ ...currentCourse, isActive: checked })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
