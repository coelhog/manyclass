import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CurrencyInput } from '@/components/ui/currency-input'
import { ClassGroup, BillingModel, ClassCategory } from '@/types'
import { DAYS, COLORS } from '@/lib/constants'

const formSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  days: z.array(z.number()).min(1, 'Selecione pelo menos um dia'),
  startTime: z.string(),
  duration: z.number().min(15, 'Mínimo 15 minutos'),
  billingModel: z.enum(['per_student', 'per_class']),
  price: z.number().min(0),
  category: z.enum(['individual', 'group', 'class']),
  studentLimit: z.number().min(1).optional(),
  color: z.string(),
  meetLink: z.string().optional(),
  generateMeet: z.boolean().default(false),
  syncGoogle: z.boolean().default(false),
})

interface ClassDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  initialData?: ClassGroup
  isSaving: boolean
}

export function ClassDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
}: ClassDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      days: [],
      startTime: '09:00',
      duration: 60,
      billingModel: 'per_student',
      price: 0,
      category: 'individual',
      studentLimit: 1,
      color: 'blue',
      meetLink: '',
      generateMeet: false,
      syncGoogle: false,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          days: initialData.days,
          startTime: initialData.startTime,
          duration: initialData.duration,
          billingModel: initialData.billingModel,
          price: initialData.price,
          category: initialData.category,
          studentLimit: initialData.studentLimit || 1,
          color: initialData.color,
          meetLink: initialData.meetLink || '',
          generateMeet: false,
          syncGoogle: false,
        })
      } else {
        form.reset({
          name: '',
          days: [],
          startTime: '09:00',
          duration: 60,
          billingModel: 'per_student',
          price: 0,
          category: 'individual',
          studentLimit: 1,
          color: 'blue',
          meetLink: '',
          generateMeet: false,
          syncGoogle: false,
        })
      }
    }
  }, [isOpen, initialData, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSave(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Turma' : 'Nova Turma'}
          </DialogTitle>
          <DialogDescription>Configure os detalhes da turma.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Inglês Básico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        if (val === 'individual') {
                          form.setValue('studentLimit', 1)
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="group">Grupo</SelectItem>
                        <SelectItem value="class">Turma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('category') !== 'individual' && (
                <FormField
                  control={form.control}
                  name="studentLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Alunos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      value={field.value.map(String)}
                      onValueChange={(val) =>
                        field.onChange(val.map((v) => Number(v)))
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cobrança</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="per_student">Por Aluno</SelectItem>
                        <SelectItem value="per_class">Por Turma</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Meet</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://meet.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 border-t pt-4">
              <FormField
                control={form.control}
                name="generateMeet"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Google Meet</FormLabel>
                      <FormDescription>
                        Gerar link automaticamente
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="syncGoogle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Google Calendar</FormLabel>
                      <FormDescription>Sincronizar agenda</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : initialData ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
