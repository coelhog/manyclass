import { KanbanTask } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2, Edit2, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockStudents } from '@/lib/mock-data'

interface KanbanTaskCardProps {
  task: KanbanTask
  onEdit: (task: KanbanTask) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
}

export function KanbanTaskCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
}: KanbanTaskCardProps) {
  const student = task.studentId
    ? mockStudents.find((s) => s.id === task.studentId)
    : null

  return (
    <Card
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all mb-3"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <span className="font-medium text-sm leading-tight">
            {task.title}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2 -mt-1"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit2 className="mr-2 h-3 w-3" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-3 w-3" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {task.category && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
              {task.category}
            </Badge>
          )}
          {task.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1 py-0 h-5"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {student && (
          <div className="flex items-center gap-2 pt-1 border-t mt-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-[8px]">
                {student.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {student.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
