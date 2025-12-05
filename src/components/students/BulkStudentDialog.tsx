import { useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Loader2 } from 'lucide-react'

interface BulkStudentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any[]) => Promise<void>
  isSaving: boolean
}

export function BulkStudentDialog({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: BulkStudentDialogProps) {
  const [bulkStudents, setBulkStudents] = useState([
    { name: '', email: '', group: '', groupName: '' },
  ])

  const addBulkRow = () => {
    setBulkStudents([
      ...bulkStudents,
      { name: '', email: '', group: '', groupName: '' },
    ])
  }

  const updateBulkRow = (index: number, field: string, value: string) => {
    const newBulk = [...bulkStudents]
    newBulk[index] = { ...newBulk[index], [field]: value }
    setBulkStudents(newBulk)
  }

  const handleSave = () => {
    onSave(bulkStudents)
    setBulkStudents([{ name: '', email: '', group: '', groupName: '' }])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Adicionar Múltiplos Alunos</DialogTitle>
          <DialogDescription>
            Preencha os dados dos alunos abaixo. Senhas serão geradas
            automaticamente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground mb-2">
              <div>Nome do Aluno</div>
              <div>Email (Opcional)</div>
              <div>Grupo (Nível)</div>
              <div>Nome do Grupo (Turma)</div>
            </div>
            {bulkStudents.map((student, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 items-center border-b pb-4"
              >
                <Input
                  placeholder="Nome"
                  value={student.name}
                  onChange={(e) => updateBulkRow(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={student.email}
                  onChange={(e) =>
                    updateBulkRow(index, 'email', e.target.value)
                  }
                />
                <Input
                  placeholder="Ex: A1"
                  value={student.group}
                  onChange={(e) =>
                    updateBulkRow(index, 'group', e.target.value)
                  }
                />
                <Input
                  placeholder="Ex: Inglês Básico"
                  value={student.groupName}
                  onChange={(e) =>
                    updateBulkRow(index, 'groupName', e.target.value)
                  }
                />
              </div>
            ))}
            <Button variant="ghost" onClick={addBulkRow} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Linha
            </Button>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Salvar Todos'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
