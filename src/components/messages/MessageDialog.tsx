import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AutomatedMessage } from '@/types'

interface MessageDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<AutomatedMessage>) => Promise<void>
}

export function MessageDialog({ isOpen, onClose, onSave }: MessageDialogProps) {
  const [newMessage, setNewMessage] = useState<Partial<AutomatedMessage>>({
    title: '',
    type: 'class_reminder',
    template: '',
    isActive: true,
    timing: '30_min_before',
  })

  const handleSave = () => {
    onSave(newMessage)
    setNewMessage({
      title: '',
      type: 'class_reminder',
      template: '',
      isActive: true,
      timing: '30_min_before',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Mensagem Automática</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={newMessage.title || ''}
              onChange={(e) =>
                setNewMessage({ ...newMessage, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={newMessage.type}
              onValueChange={(v) =>
                setNewMessage({ ...newMessage, type: v as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class_reminder">Lembrete de Aula</SelectItem>
                <SelectItem value="payment_reminder">
                  Lembrete de Pagamento
                </SelectItem>
                <SelectItem value="re_engagement">Reengajamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Momento do Envio</Label>
            <Select
              value={newMessage.timing}
              onValueChange={(v) => setNewMessage({ ...newMessage, timing: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30_min_before">30 min antes</SelectItem>
                <SelectItem value="1_hour_before">1 hora antes</SelectItem>
                <SelectItem value="on_due_date">
                  No dia do vencimento
                </SelectItem>
                <SelectItem value="30_days_inactive">
                  30 dias inativo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Template da Mensagem</Label>
            <Textarea
              value={newMessage.template || ''}
              onChange={(e) =>
                setNewMessage({ ...newMessage, template: e.target.value })
              }
              placeholder="Use {nomedoaluno} para personalizar"
              className="h-24"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis disponíveis: {'{nomedoaluno}'}, {'{link}'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
