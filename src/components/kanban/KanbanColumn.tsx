import { KanbanColumn as IKanbanColumn, KanbanTask } from '@/types'
import { KanbanTaskCard } from './KanbanTaskCard'
import { Button } from '@/components/ui/button'
import { Plus, MoreVertical, Trash2, Edit } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface KanbanColumnProps {
  column: IKanbanColumn
  tasks: KanbanTask[]
  onAddTask: (columnId: string) => void
  onEditTask: (task: KanbanTask) => void
  onDeleteTask: (id: string) => void
  onEditColumn: (column: IKanbanColumn) => void
  onDeleteColumn: (id: string) => void
  onDropTask: (taskId: string, targetColumnId: string) => void
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
  onDropTask,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onDropTask(taskId, column.id)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className="flex flex-col w-80 shrink-0 h-full max-h-full bg-muted/30 rounded-lg border"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-3 flex items-center justify-between border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEditColumn(column)}>
                <Edit className="mr-2 h-4 w-4" /> Renomear
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteColumn(column.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir Coluna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 p-2 overflow-y-auto space-y-2 min-h-[100px]">
        {tasks.map((task) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  )
}
