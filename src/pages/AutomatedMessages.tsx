import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { messageService } from '@/services/messageService'
import { AutomatedMessage } from '@/types'
import { PageTransition } from '@/components/PageTransition'
import { Plus, Trash2 } from 'lucide-react'
import { MessageDialog } from '@/components/messages/MessageDialog'

export default function AutomatedMessages() {
  const [messages, setMessages] = useState<AutomatedMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

  const handleCreate = async (newMessage: Partial<AutomatedMessage>) => {
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
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Mensagem
        </Button>
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

      <MessageDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleCreate}
      />
    </PageTransition>
  )
}
