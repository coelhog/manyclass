import { useEffect, useState } from 'react'
import { PageTransition } from '@/components/PageTransition'
import { Integration } from '@/types'
import { integrationService } from '@/services/integrationService'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import { AsaasConfigModal } from '@/components/integrations/AsaasConfigModal'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { FeatureGate } from '@/components/FeatureGate'

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
                <p style="color:#64748b;">Por favor, aguarde enquanto comunicamos com o Google.</p>
                <div style="margin-top:20px;">
                  <div style="width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
                <style>
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
              </div>
            </body>
          </html>
        `)

        // Simulate user interaction delay
        setTimeout(async () => {
          popup.close()
          try {
            // Simulate mocked tokens for Google Providers to satisfy user story about storing tokens
            // In a real app, the OAuth callback would handle this.
            let config = {}
            if (
              integration.provider === 'google_calendar' ||
              integration.provider === 'google_meet'
            ) {
              config = {
                accessToken: 'mock_access_token_' + Date.now(),
                refreshToken: 'mock_refresh_token_' + Date.now(),
                provider: 'google',
              }
            }

            await integrationService.connect(integration.id, config)
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
        }, 2500)
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

  const handleUpdateConfig = async (integration: Integration, config: any) => {
    try {
      await integrationService.updateConfig(integration.id, config)
      toast({
        title: 'Configurações atualizadas',
        description: `As configurações de ${integration.name} foram salvas.`,
      })
      loadIntegrations()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
      })
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
          {integrations.map((integration) => {
            const card = (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onUpdateConfig={handleUpdateConfig}
                isLoading={processingId === integration.id}
              />
            )

            if (integration.planRequired) {
              return (
                <FeatureGate
                  key={integration.id}
                  requiredPlan={integration.planRequired}
                  featureName={`Integração com ${integration.name}`}
                >
                  {card}
                </FeatureGate>
              )
            }

            return card
          })}
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
