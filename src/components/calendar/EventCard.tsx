import { CalendarEvent } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockStudents } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ExternalLink, Clock, Users } from 'lucide-react'

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
  const isClass = event.type === 'class'

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', event.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const colorClass =
    colorClasses[event.color || 'blue'] ||
    'bg-primary/20 border-primary/30 text-primary-foreground'

  const CardContent = (
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

      {/* Show students for classes */}
      {isClass && view === 'week' && (
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
      {isClass && view === 'month' && students.length > 0 && (
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

  return (
    <Popover>
      <PopoverTrigger asChild>{CardContent}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className={`h-2 w-full ${colorClass.split(' ')[0]}`} />
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-lg leading-none">
              {event.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {event.description || 'Sem descrição'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(event.start_time), 'HH:mm')} -{' '}
              {format(new Date(event.end_time), 'HH:mm')}
            </span>
          </div>
          {event.link && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <a href={event.link} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Entrar na Aula
              </a>
            </Button>
          )}
          {students.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Participantes ({students.length})
              </div>
              <div className="flex flex-col gap-2 max-h-[100px] overflow-y-auto">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{student.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
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
