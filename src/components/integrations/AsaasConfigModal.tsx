import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface AsaasConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: { apiKey: string; webhookUrl?: string }) => Promise<void>
}

export function AsaasConfigModal({
  isOpen,
  onClose,
  onSave,
}: AsaasConfigModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!apiKey) return
    setIsSaving(true)
    try {
      await onSave({ apiKey, webhookUrl })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Asaas</DialogTitle>
          <DialogDescription>
            Insira sua chave de API do Asaas para habilitar a integração de
            pagamentos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Chave de API (API Key)</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="$aact_..."
            />
            <p className="text-xs text-muted-foreground">
              Você pode encontrar esta chave nas configurações da sua conta
              Asaas.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="webhook">URL de Webhook (Opcional)</Label>
            <Input
              id="webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!apiKey || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Conectar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
