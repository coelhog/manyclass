import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, MessageCircle, Loader2, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageTransition } from '@/components/PageTransition'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { subscriptionService, plans } from '@/services/subscriptionService'
import { Plan } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PlansProps {
  embedded?: boolean
  onPlanSelected?: () => void
  allowSkip?: boolean
  onSkip?: () => void
}

export default function Plans({
  embedded,
  onPlanSelected,
  allowSkip,
  onSkip,
}: PlansProps) {
  const { user } = useAuth()
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsPaymentConfirmOpen(true)
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return

    setIsRedirecting(true)
    try {
      const paymentUrl = await subscriptionService.getPaymentUrl(
        selectedPlan.id,
        isAnnual ? 'yearly' : 'monthly',
      )

      // Redirect to Asaas
      window.open(paymentUrl, '_blank')

      toast.success(
        'Redirecionando para o pagamento seguro. Complete a transação na nova aba.',
      )
      setIsPaymentConfirmOpen(false)

      // Ideally, we would wait for webhook confirmation, but for this flow we assume callback
      // or user manual "I paid" check. For now, triggering callback if provided
      if (onPlanSelected) onPlanSelected()
    } catch (error: any) {
      toast.error('Erro ao gerar link de pagamento. Tente novamente.')
    } finally {
      setIsRedirecting(false)
    }
  }

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5511999999999', '_blank')
  }

  return (
    <PageTransition className={embedded ? '' : 'space-y-8'}>
      {!embedded && (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Planos e Preços</h1>
          <p className="text-xl text-muted-foreground">
            Escolha o plano ideal para sua jornada de ensino.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mb-8">
        <Label
          htmlFor="billing-cycle"
          className={`cursor-pointer ${!isAnnual ? 'font-bold' : ''}`}
        >
          Mensal
        </Label>
        <Switch
          id="billing-cycle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label
          htmlFor="billing-cycle"
          className={`cursor-pointer ${isAnnual ? 'font-bold' : ''}`}
        >
          Anual <span className="text-green-600 text-xs">(-16%)</span>
        </Label>
      </div>

      <div className="grid gap-8 md:grid-cols-3 pt-4">
        {plans.map((plan) => {
          const isCurrent = user?.plan_id === plan.id
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly

          return (
            <Card
              key={plan.id}
              className={`flex flex-col relative transition-all duration-300 ${
                plan.highlight
                  ? 'border-primary shadow-lg scale-105 z-10'
                  : 'hover:shadow-md'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-3xl font-bold mb-6">
                  R$ {price.toFixed(2).replace('.', ',')}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{isAnnual ? 'ano' : 'mês'}
                  </span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrent ? 'Plano Atual' : 'Assinar Agora'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={handleWhatsAppClick}
        >
          <MessageCircle className="h-5 w-5 text-green-600" />
          Falar com um especialista via WhatsApp
        </Button>

        {allowSkip && onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-primary"
          >
            Pular por enquanto (Testar Grátis)
          </Button>
        )}
      </div>

      {/* Redirect Confirmation Modal */}
      <Dialog
        open={isPaymentConfirmOpen}
        onOpenChange={setIsPaymentConfirmOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ir para Pagamento</DialogTitle>
            <DialogDescription>
              Você será redirecionado para a plataforma segura do Asaas para
              concluir a assinatura do plano{' '}
              <strong>{selectedPlan?.name}</strong>
              .
              <br />
              <br />
              Valor: R${' '}
              {(isAnnual
                ? selectedPlan?.priceAnnual
                : selectedPlan?.priceMonthly
              )
                ?.toFixed(2)
                .replace('.', ',')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentConfirmOpen(false)}
              disabled={isRedirecting}
            >
              Cancelar
            </Button>
            <Button onClick={handleProceedToPayment} disabled={isRedirecting}>
              {isRedirecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Ir para Asaas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
