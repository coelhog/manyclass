import { CalendarEvent } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockStudents } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventCardProps {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
  view: 'month' | 'week'
}

export function EventCard({ event, onClick, view }: EventCardProps) {
  const students = mockStudents.filter((s) => event.student_ids.includes(s.id))

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', event.id)
    e.dataTransfer.effectAllowed = 'move'
    // Add a ghost class or style if needed
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation()
        onClick(event)
      }}
      className={cn(
        'group relative cursor-pointer rounded-md border px-2 py-1 text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        event.color,
        view === 'month'
          ? 'mb-1 truncate'
          : 'absolute w-[calc(100%-8px)] mx-1 overflow-hidden',
      )}
      style={
        view === 'week'
          ? {
              top: `${getTopOffset(event.start_time)}px`,
              height: `${getHeight(event.start_time, event.end_time)}px`,
              zIndex: 10,
            }
          : {}
      }
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold truncate">{event.title}</span>
        {view === 'week' && (
          <span className="text-[10px] opacity-80">
            {format(new Date(event.start_time), 'HH:mm')}
          </span>
        )}
      </div>

      {view === 'week' && (
        <div className="mt-1 flex -space-x-2 overflow-hidden pt-1">
          {students.map((student) => (
            <Avatar
              key={student.id}
              className="h-5 w-5 border-2 border-background"
            >
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-[8px]">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </div>
  )
}

function getTopOffset(startTime: string) {
  const date = new Date(startTime)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return (hours * 60 + minutes) * (60 / 60) // 60px per hour
}

function getHeight(startTime: string, endTime: string) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
  return Math.max(diffInMinutes * (60 / 60), 30) // Minimum 30px height
}
