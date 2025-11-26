import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { messageService } from '@/services/messageService'
import { AutomatedMessage } from '@/types'
import { PageTransition } from '@/components/PageTransition'
import { Plus, Trash2, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

export default function AutomatedMessages() {
  const [messages, setMessages] = useState<AutomatedMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState<Partial<AutomatedMessage>>({
    type: 'class_reminder',
    isActive: true,
    timing: '30_min_before',
  })
  const { toast } = useToast()

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const data = await messageService.getAll()
      setMessages(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await messageService.update(id, { isActive })
      setMessages(messages.map((m) => (m.id === id ? { ...m, isActive } : m)))
      toast({ title: 'Status atualizado' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar' })
    }
  }

  const handleCreate = async () => {
    if (!newMessage.title || !newMessage.template) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos' })
      return
    }
    try {
      await messageService.create(newMessage as Omit<AutomatedMessage, 'id'>)
      toast({ title: 'Mensagem criada com sucesso' })
      setIsDialogOpen(false)
      loadMessages()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar mensagem' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta mensagem?')) {
      await messageService.delete(id)
      loadMessages()
    }
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mensagens Automáticas
          </h1>
          <p className="text-muted-foreground">
            Configure lembretes e mensagens de engajamento.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Mensagem
            </Button>
          </DialogTrigger>
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
                    <SelectItem value="class_reminder">
                      Lembrete de Aula
                    </SelectItem>
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
                  onValueChange={(v) =>
                    setNewMessage({ ...newMessage, timing: v })
                  }
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
              <Button onClick={handleCreate}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={message.isActive ? '' : 'opacity-70'}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{message.title}</CardTitle>
                <Switch
                  checked={message.isActive}
                  onCheckedChange={(checked) =>
                    handleToggle(message.id, checked)
                  }
                />
              </div>
              <CardDescription>
                {message.type === 'class_reminder' && 'Lembrete de Aula'}
                {message.type === 'payment_reminder' && 'Cobrança'}
                {message.type === 're_engagement' && 'Reengajamento'}
                {' • '}
                {message.timing.replace(/_/g, ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md text-sm italic">
                "{message.template}"
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => handleDelete(message.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </PageTransition>
  )
}
