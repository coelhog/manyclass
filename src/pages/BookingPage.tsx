import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { scheduleService } from '@/services/scheduleService'
import { classService } from '@/services/classService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Loader2,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { mockUser } from '@/lib/mock-data' // Mock teacher data

export default function BookingPage() {
  const { teacherId } = useParams<{ teacherId: string }>()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [step, setStep] = useState<'date' | 'form' | 'success'>('date')

  // Form state
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (date) {
      loadSlots(date)
    }
  }, [date])

  const loadSlots = async (selectedDate: Date) => {
    setIsLoadingSlots(true)
    setSelectedSlot(null)
    try {
      const slots = await scheduleService.getAvailableSlotsForDate(selectedDate)
      setAvailableSlots(slots)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleBooking = async () => {
    if (!date || !selectedSlot || !studentName || !studentEmail) return

    setIsBooking(true)
    try {
      // Create event
      const [hours, minutes] = selectedSlot.split(':').map(Number)
      const startTime = new Date(date)
      startTime.setHours(hours, minutes, 0, 0)

      const endTime = new Date(startTime)
      endTime.setHours(hours + 1, minutes, 0, 0) // Assuming 1h duration

      await classService.createEvent({
        title: `Aula com ${studentName}`,
        description: `Agendamento via link público. Email: ${studentEmail}`,
        type: 'class',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        student_ids: [], // In a real app, we would create/link a student user
      })

      setStep('success')
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao realizar agendamento' })
    } finally {
      setIsBooking(false)
    }
  }

  // Mock teacher info (in real app, fetch by teacherId)
  const teacher = mockUser

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Agendamento Confirmado!</h2>
              <p className="text-muted-foreground">
                Sua aula foi agendada com sucesso.
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg text-left space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {date &&
                    format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {selectedSlot} -{' '}
                  {selectedSlot && parseInt(selectedSlot.split(':')[0]) + 1}:00
                </span>
              </div>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full">
              Agendar Outro Horário
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6">
        {/* Teacher Info Sidebar */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="text-center border-b bg-muted/10">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={teacher.avatar} />
                <AvatarFallback>PF</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{teacher.name}</CardTitle>
            <CardDescription>Professor de Idiomas</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                Bem-vindo à minha página de agendamento. Selecione um horário
                disponível para marcar sua aula.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Duração: 60 min</span>
            </div>
          </CardContent>
        </Card>

        {/* Booking Area */}
        <Card className="md:col-span-2">
          {step === 'date' ? (
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Selecione uma data</h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm"
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Horários Disponíveis</h3>
                  <p className="text-sm text-muted-foreground">
                    {date
                      ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
                      : 'Selecione uma data'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {isLoadingSlots ? (
                      <div className="col-span-2 flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={
                            selectedSlot === slot ? 'default' : 'outline'
                          }
                          className="w-full"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot}
                        </Button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                        Nenhum horário disponível nesta data.
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4"
                    disabled={!selectedSlot}
                    onClick={() => setStep('form')}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Seus Dados</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('date')}
                >
                  Voltar
                </Button>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {date && format(date, 'd/MM/yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedSlot}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleBooking}
                disabled={!studentName || !studentEmail || isBooking}
              >
                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Agendamento
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
