import { Task, TaskColumn, ClassGroup } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TaskListProps {
  tasks: Task[]
  columns: TaskColumn[]
  classes: ClassGroup[]
}

const colorMap: Record<string, string> = {
  red: 'bg-red-100 text-red-800 border-red-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
}

export function TaskList({ tasks, columns, classes }: TaskListProps) {
  const getColumnTitle = (columnId: string) => {
    return columns.find((c) => c.id === columnId)?.title || columnId
  }

  const getClassName = (classId?: string) => {
    return classes.find((c) => c.id === classId)?.name || '-'
  }

  return (
    <div className="rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{getClassName(task.classId)}</TableCell>
              <TableCell>
                <Badge variant="outline">{getColumnTitle(task.status)}</Badge>
              </TableCell>
              <TableCell className="capitalize">{task.type || '-'}</TableCell>
              <TableCell>
                {task.dueDate
                  ? format(new Date(task.dueDate), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })
                  : '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {task.tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={cn(
                        'text-[10px] px-1 py-0 h-5',
                        colorMap[tag.color],
                      )}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/tasks/${task.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Nenhuma tarefa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
