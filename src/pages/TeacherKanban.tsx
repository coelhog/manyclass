import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { PageTransition } from '@/components/PageTransition'

export default function TeacherKanban() {
  return (
    <PageTransition className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quadro de Tarefas</h1>
        <p className="text-muted-foreground">
          Gerencie suas tarefas e organização interna.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </PageTransition>
  )
}
