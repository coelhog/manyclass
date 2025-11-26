import { format, isToday, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent } from '@/types'
import { cn } from '@/lib/utils'
import { EventCard } from './EventCard'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date, hour: number) => void
  onEventDrop: (eventId: string, date: Date, hour: number) => void
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
}: DayViewProps) {
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

  const dayEvents = events.filter((event) =>
    isSameDay(new Date(event.start_time), currentDate),
  )

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card animate-in fade-in duration-500">
      <div className="border-b bg-muted/40 p-4 text-center">
        <div className="text-sm font-medium text-muted-foreground uppercase">
          {format(currentDate, 'EEEE', { locale: ptBR })}
        </div>
        <div
          className={cn(
            'text-2xl font-bold',
            isToday(currentDate) && 'text-primary',
          )}
        >
          {format(currentDate, 'd')}
        </div>
      </div>

      <ScrollArea className="flex-1 h-[600px]">
        <div className="grid grid-cols-[60px_1fr] relative">
          {/* Time Column */}
          <div className="border-r bg-background sticky left-0 z-20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b text-xs text-muted-foreground flex items-start justify-center pt-1 bg-background"
              >
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b hover:bg-accent/5 transition-colors"
                onClick={() => onDateClick(currentDate, hour)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, currentDate, hour)}
              />
            ))}

            {/* Events Layer */}
            {dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={onEventClick}
                view="week" // Reuse week view styling for positioning
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
