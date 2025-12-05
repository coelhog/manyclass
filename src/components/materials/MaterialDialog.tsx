import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Upload, Loader2 } from 'lucide-react'
import { Student } from '@/types'

interface MaterialDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any, file: File | null) => Promise<void>
  students: Student[]
  isUploading: boolean
}

export function MaterialDialog({
  isOpen,
  onClose,
  onSave,
  students,
  isUploading,
}: MaterialDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studentIds: [] as string[],
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSave = () => {
    onSave(formData, selectedFile)
    if (!isUploading) {
      setFormData({ title: '', description: '', studentIds: [] })
      setSelectedFile(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Material</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  {selectedFile
                    ? selectedFile.name
                    : 'Clique ou arraste o arquivo'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, PPTX (Max 10MB)
                </p>
              </div>
            </div>
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
                    checked={formData.studentIds.includes(student.id)}
                    onCheckedChange={(checked) => {
                      if (checked)
                        setFormData((prev) => ({
                          ...prev,
                          studentIds: [...prev.studentIds, student.id],
                        }))
                      else
                        setFormData((prev) => ({
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
          <Button onClick={handleSave} disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Enviar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
