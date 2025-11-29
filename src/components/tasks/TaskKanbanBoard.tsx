import { useState } from 'react'
import { Task, TaskColumn } from '@/types'
import { TaskKanbanColumn } from './TaskKanbanColumn'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TaskKanbanBoardProps {
  tasks: Task[]
  columns: TaskColumn[]
  onTaskMove: (taskId: string, newColumnId: string) => void
  onColumnsChange: (columns: TaskColumn[]) => void
}

export function TaskKanbanBoard({
  tasks,
  columns,
  onTaskMove,
  onColumnsChange,
}: TaskKanbanBoardProps) {
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const handleAddColumn = () => {
    if (!newColumnTitle) return
    const newColumn: TaskColumn = {
      id: Math.random().toString(36).substr(2, 9),
      title: newColumnTitle,
      order: columns.length,
    }
    onColumnsChange([...columns, newColumn])
    setNewColumnTitle('')
    setIsAddColumnOpen(false)
  }

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, title: newTitle } : col,
    )
    onColumnsChange(updatedColumns)
  }

  const handleDeleteColumn = (columnId: string) => {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
      const updatedColumns = columns.filter((col) => col.id !== columnId)
      onColumnsChange(updatedColumns)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 w-full whitespace-nowrap rounded-md border bg-background/50 p-4">
        <div className="flex gap-4 h-full min-h-[500px]">
          {columns.map((column) => (
            <TaskKanbanColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((t) => t.status === column.id)}
              onTaskMove={onTaskMove}
              onRename={handleRenameColumn}
              onDelete={handleDeleteColumn}
            />
          ))}
          <div className="w-80 shrink-0">
            <Button
              variant="outline"
              className="w-full h-12 border-dashed"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
            </Button>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Coluna</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Título da Coluna</Label>
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Ex: Em Revisão"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddColumn}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
