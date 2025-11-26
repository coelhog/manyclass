import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarEvent } from '@/types'
import { cn } from '@/lib/utils'
import { EventCard } from './EventCard'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
  onEventDrop: (eventId: string, date: Date) => void
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const eventId = e.dataTransfer.getData('text/plain')
    if (eventId) {
      onEventDrop(eventId, date)
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-card animate-in fade-in duration-500">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
        {days.map((day, dayIdx) => {
          const dayEvents = events.filter((event) =>
            isSameDay(new Date(event.start_time), day),
          )

          return (
            <div
              key={day.toString()}
              className={cn(
                'min-h-[100px] border-b border-r p-2 transition-colors hover:bg-accent/5 relative group',
                !isSameMonth(day, monthStart) &&
                  'bg-muted/10 text-muted-foreground',
                dayIdx % 7 === 6 && 'border-r-0', // Remove right border for last column
              )}
              onClick={() => onDateClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div
                className={cn(
                  'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm',
                  isToday(day) &&
                    'bg-primary text-primary-foreground font-bold',
                )}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    view="month"
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
