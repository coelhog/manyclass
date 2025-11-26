import { useState } from 'react'
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
import { mockPayments } from '@/lib/mock-data'

export default function Payments() {
  const [payments] = useState(mockPayments)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Registrar Pagamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Receita Total (Mês)
          </div>
          <div className="text-2xl font-bold mt-2">R$ 4.250,00</div>
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Pendente
          </div>
          <div className="text-2xl font-bold mt-2 text-yellow-600">
            R$ 1.250,00
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            Atrasado
          </div>
          <div className="text-2xl font-bold mt-2 text-red-600">R$ 450,00</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pagamentos..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border bg-card">
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
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.student}</TableCell>
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
                  <Button variant="ghost" size="sm">
                    <DollarSign className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
