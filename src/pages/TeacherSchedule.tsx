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
import { TeacherSchedule as ScheduleType } from '@/types'
import { PageTransition } from '@/components/PageTransition'
import { useToast } from '@/hooks/use-toast'
import { Copy, ExternalLink, Settings } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid'

export default function TeacherSchedule() {
  const { user } = useAuth()
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

    const newAvailability = [...schedule.availability]

    if (existingSlotIndex >= 0) {
      newAvailability.splice(existingSlotIndex, 1)
    } else {
      newAvailability.push({
        dayOfWeek: dayIndex,
        startTime,
        endTime,
        planIds: ['basic', 'intermediate', 'premium'],
      })
    }

    const updatedSchedule = { ...schedule, availability: newAvailability }
    setSchedule(updatedSchedule)

    try {
      await scheduleService.updateSchedule(updatedSchedule)
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar disponibilidade' })
    }
  }

  const updateSettings = async (updates: Partial<ScheduleType>) => {
    if (!schedule) return
    const updated = { ...schedule, ...updates }
    setSchedule(updated)
    try {
      await scheduleService.updateSchedule(updated)
      toast({ title: 'Configurações atualizadas' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar configurações' })
    }
  }

  const bookingLink = `${window.location.origin}/book/${user?.id || 'demo'}`

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink)
    toast({ title: 'Link copiado para a área de transferência' })
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Agenda de Disponibilidade
          </h1>
          <p className="text-muted-foreground">
            Defina seus horários e configure seu link de agendamento.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Grade Horária</CardTitle>
            <CardDescription>
              Clique nos horários para ativar ou desativar sua disponibilidade
              geral.
              <br />
              <span className="text-xs text-muted-foreground italic">
                * Horários com aulas marcadas serão bloqueados automaticamente
                no link público.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleGrid schedule={schedule} onToggleSlot={toggleSlot} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Link de Agendamento</CardTitle>
              <CardDescription>Compartilhe com seus alunos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="link-active">Link Ativo</Label>
                <Switch
                  id="link-active"
                  checked={schedule?.bookingLinkEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ bookingLinkEnabled: checked })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Input value={bookingLink} readOnly className="text-xs" />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="secondary" className="w-full" asChild>
                <Link to={`/book/${user?.id || 'demo'}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" /> Testar Link
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" /> Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Duração da Aula (minutos)</Label>
                <Input
                  type="number"
                  value={schedule?.bookingDuration || 60}
                  onChange={(e) =>
                    updateSettings({ bookingDuration: Number(e.target.value) })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
