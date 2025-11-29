import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MoreHorizontal, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TaskKanbanCardProps {
  task: Task
  onDragStart: (e: React.DragEvent, taskId: string) => void
}

const colorMap: Record<string, string> = {
  red: 'bg-red-100 text-red-800 border-red-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function TaskKanbanCard({ task, onDragStart }: TaskKanbanCardProps) {
  return (
    <Card
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all mb-3"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <span className="font-medium text-sm leading-tight line-clamp-2">
            {task.title}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2 -mt-1"
            asChild
          >
            <Link to={`/tasks/${task.id}`}>
              <Eye className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className={cn('text-[10px] px-1 py-0 h-5', colorMap[tag.color])}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 border-t mt-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
