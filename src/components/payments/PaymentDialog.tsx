import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Student, Payment } from '@/types'

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  students: Student[]
  initialData?: Payment
}

export function PaymentDialog({
  isOpen,
  onClose,
  onSave,
  students,
  initialData,
}: PaymentDialogProps) {
  const [formData, setFormData] = useState<{
    studentIds: string[]
    description: string
    amount: number
    dueDate: Date | undefined
  }>({
    studentIds: [],
    description: '',
    amount: 0,
    dueDate: new Date(),
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          studentIds: [initialData.studentId],
          description: initialData.description || '',
          amount: initialData.amount,
          dueDate: new Date(initialData.dueDate),
        })
      } else {
        setFormData({
          studentIds: [],
          description: '',
          amount: 0,
          dueDate: new Date(),
        })
      }
    }
  }, [isOpen, initialData])

  const studentOptions = students.map((s) => ({
    label: s.name,
    value: s.id,
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Pagamento' : 'Novo Pagamento'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Atualize as informações do pagamento.'
              : 'Registre um novo pagamento para um ou mais alunos.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!initialData && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student" className="text-right">
                Alunos
              </Label>
              <div className="col-span-3">
                <MultiSelect
                  options={studentOptions}
                  selected={formData.studentIds}
                  onChange={(selected) =>
                    setFormData({ ...formData, studentIds: selected })
                  }
                  placeholder="Selecione os alunos"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Input
              id="description"
              className="col-span-3"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
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
            <div className="col-span-3">
              <CurrencyInput
                id="amount"
                value={formData.amount}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    amount: val,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Vencimento
            </Label>
            <div className="col-span-3">
              <DatePicker
                date={formData.dueDate}
                setDate={(date) => setFormData({ ...formData, dueDate: date })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(formData)}>
            {initialData ? 'Salvar' : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
