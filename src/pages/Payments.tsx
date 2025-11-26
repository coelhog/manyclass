import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, DollarSign } from 'lucide-react'
import { studentService } from '@/services/studentService'
import { Payment, Student } from '@/types'
import { PageTransition } from '@/components/PageTransition'
import { TableSkeleton } from '@/components/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { MultiSelect } from '@/components/ui/multi-select'

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    studentIds: [] as string[],
    description: '',
    amount: 0,
    dueDate: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [payData, studData] = await Promise.all([
        studentService.getAllPayments(),
        studentService.getAll(),
      ])
      setPayments(payData)
      setStudents(studData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (newPayment.studentIds.length === 0 || !newPayment.amount) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }
    try {
      // Create a payment for each selected student
      for (const studentId of newPayment.studentIds) {
        const student = students.find((s) => s.id === studentId)
        await studentService.createPayment({
          studentId: studentId,
          student: student?.name || 'Unknown',
          description: newPayment.description,
          amount: newPayment.amount,
          status: 'pending',
          dueDate: newPayment.dueDate || new Date().toISOString(),
        })
      }

      toast({ title: 'Pagamentos registrados com sucesso!' })
      setIsDialogOpen(false)
      loadData()
      setNewPayment({
        studentIds: [],
        description: '',
        amount: 0,
        dueDate: '',
      })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao registrar pagamento' })
    }
  }

  const studentOptions = students.map((s) => ({
    label: s.name,
    value: s.id,
  }))

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm hover:shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> Registrar Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
              <DialogDescription>
                Registre um novo pagamento manual para um ou mais alunos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student" className="text-right">
                  Alunos
                </Label>
                <div className="col-span-3">
                  <MultiSelect
                    options={studentOptions}
                    selected={newPayment.studentIds}
                    onChange={(selected) =>
                      setNewPayment({ ...newPayment, studentIds: selected })
                    }
                    placeholder="Selecione os alunos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  className="col-span-3"
                  value={newPayment.description}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Ex: Mensalidade Junho"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Valor (R$)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  className="col-span-3"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Vencimento
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  className="col-span-3"
                  value={newPayment.dueDate}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Registrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        ) : (
          <>
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-muted-foreground">
                Receita Total (Mês)
              </div>
              <div className="text-2xl font-bold mt-2">R$ 4.250,00</div>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-muted-foreground">
                Pendente
              </div>
              <div className="text-2xl font-bold mt-2 text-yellow-600">
                R$ 1.250,00
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-muted-foreground">
                Atrasado
              </div>
              <div className="text-2xl font-bold mt-2 text-red-600">
                R$ 450,00
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pagamentos..." className="pl-8" />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : (
        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {payment.student}
                  </TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === 'paid'
                          ? 'default'
                          : payment.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {payment.status === 'paid'
                        ? 'Pago'
                        : payment.status === 'pending'
                          ? 'Pendente'
                          : 'Atrasado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-primary"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageTransition>
  )
}
