import { CalendarEvent } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockStudents } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface EventCardProps {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
  view: 'month' | 'week'
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200',
  green: 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200',
  red: 'bg-red-100 border-red-200 text-red-800 hover:bg-red-200',
  yellow: 'bg-yellow-100 border-yellow-200 text-yellow-800 hover:bg-yellow-200',
  purple: 'bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200',
  orange: 'bg-orange-100 border-orange-200 text-orange-800 hover:bg-orange-200',
  pink: 'bg-pink-100 border-pink-200 text-pink-800 hover:bg-pink-200',
}

export function EventCard({ event, onClick, view }: EventCardProps) {
  const students = mockStudents.filter((s) => event.student_ids.includes(s.id))
  const isTask = event.type === 'task'

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', event.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const colorClass =
    colorClasses[event.color || 'blue'] ||
    'bg-primary/20 border-primary/30 text-primary-foreground'

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
        colorClass,
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

      {/* Only show students for classes, not tasks */}
      {!isTask && view === 'week' && (
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
      {!isTask && view === 'month' && students.length > 0 && (
        <div className="flex items-center gap-1 mt-0.5">
          <Avatar className="h-3 w-3">
            <AvatarImage src={students[0].avatar} />
            <AvatarFallback className="text-[6px]">
              {students[0].name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[8px] opacity-80 truncate max-w-[60px]">
            {students[0].name}
          </span>
          {students.length > 1 && (
            <span className="text-[8px] opacity-80">
              +{students.length - 1}
            </span>
          )}
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
