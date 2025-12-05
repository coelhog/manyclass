import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { ClassGroup, Student, Task } from '@/types'

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>, date?: Date, time?: string) => Promise<void>
  classes: ClassGroup[]
  students: Student[]
  initialData?: Partial<Task>
}

export function TaskDialog({
  isOpen,
  onClose,
  onSave,
  classes,
  students,
  initialData,
}: TaskDialogProps) {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'text',
    tags: [],
    color: 'blue',
  })
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined)
  const [taskTime, setTaskTime] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNewTask(initialData)
        if (initialData.dueDate) {
          const d = new Date(initialData.dueDate)
          setTaskDate(d)
          setTaskTime(
            d.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          )
        }
      } else {
        setNewTask({ type: 'text', tags: [], color: 'blue' })
        setTaskDate(undefined)
        setTaskTime('')
      }
    }
  }, [isOpen, initialData])

  const handleSave = () => {
    onSave(newTask, taskDate, taskTime)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Título *</Label>
            <Input
              value={newTask.title || ''}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Textarea
              value={newTask.description || ''}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Turma (Opcional)</Label>
              <Select
                value={newTask.classId || 'none'}
                onValueChange={(v) =>
                  setNewTask({
                    ...newTask,
                    classId: v === 'none' ? undefined : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Aluno (Opcional)</Label>
              <Select
                value={newTask.studentId || 'none'}
                onValueChange={(v) =>
                  setNewTask({
                    ...newTask,
                    studentId: v === 'none' ? undefined : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Data de Entrega (Opcional)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DatePicker date={taskDate} setDate={setTaskDate} />
              </div>
              <Input
                type="time"
                className="w-32"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Se definida, aparecerá no calendário.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            {initialData?.id ? 'Salvar Alterações' : 'Criar Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
