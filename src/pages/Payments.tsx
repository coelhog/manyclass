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
import { Plus, Search, DollarSign, Edit } from 'lucide-react'
import { studentService } from '@/services/studentService'
import { Payment, Student } from '@/types'
import { PageTransition } from '@/components/PageTransition'
import { TableSkeleton } from '@/components/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { PaymentDialog } from '@/components/payments/PaymentDialog'

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(
    undefined,
  )
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

  const handleSave = async (data: any) => {
    if ((!editingPayment && data.studentIds.length === 0) || !data.amount) {
      toast({
        variant: 'destructive',
        title: 'Preencha os campos obrigatórios',
      })
      return
    }

    try {
      if (editingPayment) {
        // Mock update for now as studentService needs update method
        // In real app: await studentService.updatePayment(editingPayment.id, { ... })
        toast({ title: 'Pagamento atualizado! (Simulação)' })
      } else {
        for (const studentId of data.studentIds) {
          await studentService.createPayment({
            studentId: studentId,
            description: data.description,
            amount: data.amount,
            status: 'pending',
            dueDate: data.dueDate
              ? data.dueDate.toISOString()
              : new Date().toISOString(),
          })
        }
        toast({ title: 'Pagamentos registrados com sucesso!' })
      }
      setIsDialogOpen(false)
      setEditingPayment(undefined)
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar pagamento' })
    }
  }

  const openEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setIsDialogOpen(true)
  }

  const openCreate = () => {
    setEditingPayment(undefined)
    setIsDialogOpen(true)
  }

  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const pendingRevenue = payments
    .filter((p) => p.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const overdueRevenue = payments
    .filter((p) => p.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
        <Button
          className="shadow-sm hover:shadow-md transition-all"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" /> Registrar Pagamento
        </Button>
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
                Receita Total (Pago)
              </div>
              <div className="text-2xl font-bold mt-2">
                R$ {totalRevenue.toFixed(2)}
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-muted-foreground">
                Pendente
              </div>
              <div className="text-2xl font-bold mt-2 text-yellow-600">
                R$ {pendingRevenue.toFixed(2)}
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-medium text-muted-foreground">
                Atrasado
              </div>
              <div className="text-2xl font-bold mt-2 text-red-600">
                R$ {overdueRevenue.toFixed(2)}
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary"
                        onClick={() => openEdit(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary"
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaymentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        students={students}
        initialData={editingPayment}
      />
    </PageTransition>
  )
}
