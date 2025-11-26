import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { scheduleService } from '@/services/scheduleService'
import { TeacherSchedule as ScheduleType, TimeSlot } from '@/types'
import { PageTransition } from '@/components/PageTransition'
import { useToast } from '@/hooks/use-toast'
import { Check, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const DAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
]
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

export default function TeacherSchedule() {
  const [schedule, setSchedule] = useState<ScheduleType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    setIsLoading(true)
    try {
      const data = await scheduleService.getSchedule()
      setSchedule(data)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSlot = async (dayIndex: number, hour: number) => {
    if (!schedule) return

    const startTime = `${hour.toString().padStart(2, '0')}:00`
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`

    const existingSlotIndex = schedule.availability.findIndex(
      (s) => s.dayOfWeek === dayIndex && s.startTime === startTime,
    )

    let newAvailability = [...schedule.availability]

    if (existingSlotIndex >= 0) {
      // Remove slot
      newAvailability.splice(existingSlotIndex, 1)
    } else {
      // Add slot
      newAvailability.push({
        dayOfWeek: dayIndex,
        startTime,
        endTime,
        planIds: ['basic', 'intermediate', 'premium'], // Default to all
      })
    }

    setSchedule({ ...schedule, availability: newAvailability })

    try {
      await scheduleService.updateAvailability(newAvailability)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar disponibilidade' })
    }
  }

  const isSlotActive = (dayIndex: number, hour: number) => {
    if (!schedule) return false
    const startTime = `${hour.toString().padStart(2, '0')}:00`
    return schedule.availability.some(
      (s) => s.dayOfWeek === dayIndex && s.startTime === startTime,
    )
  }

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Agenda de Disponibilidade
        </h1>
        <p className="text-muted-foreground">
          Defina seus horários disponíveis para agendamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Horária</CardTitle>
          <CardDescription>
            Clique nos horários para ativar ou desativar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-bold text-center py-2">Horário</div>
                {DAYS.map((day, i) => (
                  <div
                    key={day}
                    className="font-bold text-center py-2 bg-muted/30 rounded-md"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    {hour}:00
                  </div>
                  {DAYS.map((_, dayIndex) => {
                    const active = isSlotActive(dayIndex, hour)
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        onClick={() => toggleSlot(dayIndex, hour)}
                        className={`
                          h-12 rounded-md border flex items-center justify-center cursor-pointer transition-all
                          ${
                            active
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'hover:bg-accent hover:border-accent-foreground/20 bg-card'
                          }
                        `}
                      >
                        {active && <Check className="h-5 w-5" />}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
