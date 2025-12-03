import { useEffect, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { classService } from '@/services/classService'
import { ClassGroup } from '@/types'
import { TableSkeleton } from '@/components/skeletons'
import { useToast } from '@/hooks/use-toast'

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    setIsLoading(true)
    try {
      const data = await classService.getAllClasses()
      setClasses(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active'
    try {
      await classService.updateClass(id, { status: newStatus })
      setClasses(
        classes.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
      )
      toast({
        title: `Turma ${newStatus === 'active' ? 'ativada' : 'arquivada'}`,
      })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' })
    }
  }

  if (isLoading) return <TableSkeleton columns={6} rows={5} />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Gerenciamento de Aulas
        </h2>
        <Badge variant="secondary">{classes.length} Turmas</Badge>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Alunos</TableHead>
              <TableHead>Status (Ativo/Inativo)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.name}</TableCell>
                <TableCell>{cls.schedule}</TableCell>
                <TableCell className="capitalize">{cls.category}</TableCell>
                <TableCell>{cls.studentIds.length}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cls.status === 'active'}
                      onCheckedChange={() =>
                        handleStatusChange(cls.id, cls.status)
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {cls.status === 'active' ? 'Ativo' : 'Arquivado'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhuma turma encontrada no sistema.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
