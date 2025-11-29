import { Task } from '@/types'
import { TaskKanbanCard } from './TaskKanbanCard'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface TaskKanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: 'open' | 'closed') => void
}

export function TaskKanbanBoard({ tasks, onTaskMove }: TaskKanbanBoardProps) {
  const columns = [
    { id: 'open', title: 'Abertas', status: 'open' as const },
    { id: 'closed', title: 'Fechadas', status: 'closed' as const },
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: 'open' | 'closed') => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      onTaskMove(taskId, status)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <ScrollArea className="h-full w-full whitespace-nowrap rounded-md border bg-background/50 p-4">
      <div className="flex gap-4 h-full min-h-[500px]">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.status)
          return (
            <div
              key={column.id}
              className="flex flex-col w-80 shrink-0 h-full max-h-full bg-muted/30 rounded-lg border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="p-3 flex items-center justify-between border-b bg-muted/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-2 overflow-y-auto space-y-2 min-h-[100px]">
                {columnTasks.map((task) => (
                  <TaskKanbanCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4 border-2 border-dashed rounded-md m-2">
                    Arraste tarefas aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
