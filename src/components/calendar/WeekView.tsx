import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  addMinutes,
  startOfDay,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent } from '@/types'
import { cn } from '@/lib/utils'
import { EventCard } from './EventCard'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date, hour: number) => void
  onEventDrop: (eventId: string, date: Date, hour: number) => void
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
}: WeekViewProps) {
  const startDate = startOfWeek(currentDate)
  const endDate = endOfWeek(currentDate)
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault()
    const eventId = e.dataTransfer.getData('text/plain')
    if (eventId) {
      onEventDrop(eventId, date, hour)
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card animate-in fade-in duration-500">
      <div className="grid grid-cols-8 border-b bg-muted/40">
        <div className="py-2 text-center text-sm font-medium text-muted-foreground border-r">
          Hora
        </div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              'py-2 text-center text-sm font-medium border-r last:border-r-0',
              isToday(day) && 'text-primary font-bold',
            )}
          >
            <div className="text-xs text-muted-foreground uppercase">
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className={cn('text-lg', isToday(day) && 'text-primary')}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <ScrollArea className="flex-1 h-[600px]">
        <div className="grid grid-cols-8 relative min-w-[800px]">
          {/* Time Column */}
          <div className="border-r bg-background sticky left-0 z-20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b text-xs text-muted-foreground flex items-start justify-center pt-1"
              >
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {days.map((day) => {
            const dayEvents = events.filter((event) =>
              isSameDay(new Date(event.start_time), day),
            )

            return (
              <div
                key={day.toString()}
                className="relative border-r last:border-r-0"
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b hover:bg-accent/5 transition-colors"
                    onClick={() => onDateClick(day, hour)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day, hour)}
                  />
                ))}

                {/* Events Layer */}
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    view="week"
                  />
                ))}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
