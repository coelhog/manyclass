import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarEvent, CreateEventDTO, EventType } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockStudents } from '@/lib/mock-data'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parse } from 'date-fns'
import { DatePicker } from '@/components/ui/date-picker'

const EVENT_COLORS = [
  { label: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { label: 'Verde', value: 'green', class: 'bg-green-500' },
  { label: 'Vermelho', value: 'red', class: 'bg-red-500' },
  { label: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
  { label: 'Roxo', value: 'purple', class: 'bg-purple-500' },
  { label: 'Laranja', value: 'orange', class: 'bg-orange-500' },
  { label: 'Rosa', value: 'pink', class: 'bg-pink-500' },
]

const formSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  type: z.enum(['class', 'task', 'test'] as [string, ...string[]]),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().optional(),
  student_ids: z.array(z.string()),
  color: z.string().optional(),
})

interface ClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateEventDTO) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  event?: CalendarEvent | null
  initialDate?: Date
}

export function ClassModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
}: ClassModalProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: 'class',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      student_ids: [],
      color: 'blue',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (event) {
        const start = new Date(event.start_time)
        const end = new Date(event.end_time)
        form.reset({
          title: event.title,
          type: event.type,
          date: start,
          startTime: format(start, 'HH:mm'),
          endTime: format(end, 'HH:mm'),
          description: event.description || '',
          student_ids: event.student_ids,
          color: event.color || 'blue',
        })
      } else {
        const dateToUse = initialDate || new Date()
        form.reset({
          title: '',
          type: 'class',
          date: dateToUse,
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          student_ids: [],
          color: 'blue',
        })
      }
    }
  }, [isOpen, event, initialDate, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)
    try {
      const dateStr = format(values.date, 'yyyy-MM-dd')
      const startDateTime = new Date(`${dateStr}T${values.startTime}`)
      const endDateTime = new Date(`${dateStr}T${values.endTime}`)

      await onSave({
        title: values.title,
        type: values.type as EventType,
        description: values.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        student_ids: values.student_ids,
        color: values.color,
      })
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (event && onDelete) {
      if (confirm('Tem certeza que deseja excluir este evento?')) {
        setIsSaving(true)
        await onDelete(event.id)
        setIsSaving(false)
        onClose()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do evento abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aula de Inglês" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="class">Aula</SelectItem>
                        <SelectItem value="task">Tarefa</SelectItem>
                        <SelectItem value="test">Prova</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_COLORS.map((color) => (
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DatePicker date={field.value} setDate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ... rest of the form */}
            <FormField
              control={form.control}
              name="student_ids"
              render={() => (
                <FormItem>
                  <FormLabel>Alunos</FormLabel>
                  <div className="rounded-md border p-2">
                    <ScrollArea className="h-24">
                      <div className="space-y-2">
                        {mockStudents.map((student) => (
                          <FormField
                            key={student.id}
                            control={form.control}
                            name="student_ids"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={student.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        student.id,
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              student.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== student.id,
                                              ),
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {student.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes adicionais..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              {event && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="mr-auto"
                >
                  Excluir
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
