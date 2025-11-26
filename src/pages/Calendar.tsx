import { useState } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Agendar Aula
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Navegação</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="h-full min-h-[500px]">
          <CardHeader>
            <CardTitle>
              Agenda para{' '}
              {date?.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock events for the day */}
              <div className="flex items-center p-4 border rounded-lg bg-accent/10 border-accent/20">
                <div className="w-16 text-center border-r pr-4 mr-4">
                  <div className="font-bold text-lg">09:00</div>
                  <div className="text-xs text-muted-foreground">10:30</div>
                </div>
                <div>
                  <h3 className="font-semibold">Inglês Iniciante A1</h3>
                  <p className="text-sm text-muted-foreground">
                    Sala Virtual 1 • Gramática Básica
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 border rounded-lg">
                <div className="w-16 text-center border-r pr-4 mr-4">
                  <div className="font-bold text-lg">14:00</div>
                  <div className="text-xs text-muted-foreground">15:00</div>
                </div>
                <div>
                  <h3 className="font-semibold">
                    Aula Particular - João Pedro
                  </h3>
                  <p className="text-sm text-muted-foreground">Conversação</p>
                </div>
              </div>

              <div className="text-center text-muted-foreground py-8">
                Não há mais aulas agendadas para este dia.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
