import { useState } from 'react'
import { Task, TaskColumn } from '@/types'
import { TaskKanbanCard } from './TaskKanbanCard'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TaskKanbanColumnProps {
  column: TaskColumn
  tasks: Task[]
  onTaskMove: (taskId: string, newColumnId: string) => void
  onRename: (columnId: string, newTitle: string) => void
  onDelete: (columnId: string) => void
}

export function TaskKanbanColumn({
  column,
  tasks,
  onTaskMove,
  onRename,
  onDelete,
}: TaskKanbanColumnProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(column.title)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onTaskMove(taskId, column.id)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleRenameSubmit = () => {
    if (newTitle) {
      onRename(column.id, newTitle)
      setIsRenameOpen(false)
    }
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
              <Edit className="mr-2 h-4 w-4" /> Renomear
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(column.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir Coluna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 p-2 overflow-y-auto space-y-2 min-h-[100px]">
        {tasks.map((task) => (
          <TaskKanbanCard
            key={task.id}
            task={task}
            onDragStart={handleDragStart}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-4 border-2 border-dashed rounded-md m-2">
            Arraste tarefas aqui
          </div>
        )}
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Coluna</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Novo Título</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleRenameSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
