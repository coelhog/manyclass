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
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { teacherService } from '@/services/teacherService'
import { User } from '@/types'
import { Link } from 'react-router-dom'
import { TableSkeleton } from '@/components/skeletons'

export default function TeachersList() {
  const [teachers, setTeachers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTeachers = async () => {
      setIsLoading(true)
      try {
        const data = await teacherService.getAll()
        setTeachers(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadTeachers()
  }, [])

  if (isLoading) return <TableSkeleton columns={5} rows={5} />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Professores</h2>
        <Button>Adicionar Professor</Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      teacher.plan_id === 'premium'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : teacher.plan_id === 'intermediate'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : ''
                    }
                  >
                    {teacher.plan_id
                      ? teacher.plan_id.charAt(0).toUpperCase() +
                        teacher.plan_id.slice(1)
                      : 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>{teacher.phone || '-'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/teachers/${teacher.id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
