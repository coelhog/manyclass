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
import { Check, MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageTransition } from '@/components/PageTransition'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { subscriptionService, plans } from '@/services/subscriptionService'
import { Plan, PlanType } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
  const { user, updateUser } = useAuth()
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Payment Form State
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsPaymentOpen(true)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan || !user) return

    setIsProcessing(true)
    try {
      await subscriptionService.processPayment(
        {
          number: cardNumber,
          cvv: cardCvv,
          expiry: cardExpiry,
          name: cardName,
        },
        selectedPlan.id,
        isAnnual ? 'yearly' : 'monthly',
      )

      // Update User Subscription
      await updateUser({
        plan_id: selectedPlan.id,
        subscriptionStatus: 'active',
        trialEndsAt: undefined, // Clear trial if paid
      })

      toast.success('Pagamento realizado com sucesso! Plano ativado.')
      setIsPaymentOpen(false)
      if (onPlanSelected) onPlanSelected()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar pagamento')
    } finally {
      setIsProcessing(false)
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

      {/* Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assinar Plano {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Insira os dados do cartão de crédito para confirmar a assinatura.
              <br />
              <span className="font-bold text-primary">
                Total: R${' '}
                {(isAnnual
                  ? selectedPlan?.priceAnnual
                  : selectedPlan?.priceMonthly
                )
                  ?.toFixed(2)
                  .replace('.', ',')}
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome no Cartão</Label>
              <Input
                id="name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Como impresso no cartão"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número do Cartão</Label>
              <Input
                id="number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/AA"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Confirmar Pagamento'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
