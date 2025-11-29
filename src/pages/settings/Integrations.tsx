import { useEffect, useState } from 'react'
import { PageTransition } from '@/components/PageTransition'
import { Integration } from '@/types'
import { integrationService } from '@/services/integrationService'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import { AsaasConfigModal } from '@/components/integrations/AsaasConfigModal'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isAsaasModalOpen, setIsAsaasModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const data = await integrationService.getAll()
      setIntegrations(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (integration: Integration) => {
    if (integration.type === 'api_key' && integration.provider === 'asaas') {
      setIsAsaasModalOpen(true)
      return
    }

    if (integration.type === 'oauth') {
      setProcessingId(integration.id)

      // Simulate OAuth Popup Flow
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(
        'about:blank',
        'oauth_window',
        `width=${width},height=${height},top=${top},left=${left}`,
      )

      if (popup) {
        popup.document.write(`
          <html>
            <head><title>Autenticando...</title></head>
            <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f8fafc;">
              <div style="text-align:center;">
                <h2 style="color:#0f172a;">Conectando ao ${integration.name}...</h2>
                <p style="color:#64748b;">Por favor, aguarde.</p>
              </div>
            </body>
          </html>
        `)

        // Simulate user interaction delay
        setTimeout(async () => {
          popup.close()
          try {
            await integrationService.connect(integration.id)
            toast({
              title: 'Integração conectada!',
              description: `${integration.name} foi conectado com sucesso.`,
            })
            loadIntegrations()
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Erro na conexão',
              description: 'Não foi possível completar a autenticação.',
            })
          } finally {
            setProcessingId(null)
          }
        }, 2000)
      } else {
        setProcessingId(null)
        toast({
          variant: 'destructive',
          title: 'Popup bloqueado',
          description:
            'Por favor, permita popups para conectar esta integração.',
        })
      }
    }
  }

  const handleAsaasSave = async (config: { apiKey: string }) => {
    try {
      await integrationService.connect('asaas', config)
      toast({
        title: 'Asaas conectado!',
        description: 'Integração configurada com sucesso.',
      })
      loadIntegrations()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Verifique sua chave de API.',
      })
    }
  }

  const handleDisconnect = async (integration: Integration) => {
    if (confirm(`Deseja desconectar ${integration.name}?`)) {
      setProcessingId(integration.id)
      try {
        await integrationService.disconnect(integration.id)
        toast({
          title: 'Desconectado',
          description: `${integration.name} foi desconectado.`,
        })
        loadIntegrations()
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao desconectar',
        })
      } finally {
        setProcessingId(null)
      }
    }
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hover:bg-muted/50"
        >
          <Link to="/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground">
            Conecte serviços externos para potencializar sua produtividade.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isLoading={processingId === integration.id}
            />
          ))}
        </div>
      )}

      <AsaasConfigModal
        isOpen={isAsaasModalOpen}
        onClose={() => setIsAsaasModalOpen(false)}
        onSave={handleAsaasSave}
      />
    </PageTransition>
  )
}
