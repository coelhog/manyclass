import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubscriptionStatus } from '@/types'

interface SubscriptionAlertProps {
  status: SubscriptionStatus
  daysRemaining?: number
}

export function SubscriptionAlert({
  status,
  daysRemaining,
}: SubscriptionAlertProps) {
  if (status === 'active' && (daysRemaining === undefined || daysRemaining > 7))
    return null

  const isExpired = status === 'expired' || status === 'past_due'
  const isWarning = status === 'active' && daysRemaining && daysRemaining <= 7

  return (
    <Alert
      variant={isExpired ? 'destructive' : 'default'}
      className={`mb-6 ${isWarning ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {isExpired ? 'Assinatura Expirada' : 'Renovação Próxima'}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between mt-2">
        <span>
          {isExpired
            ? 'Sua assinatura expirou. Renove agora para continuar acessando.'
            : `Sua assinatura vence em ${daysRemaining} dias.`}
        </span>
        <Button size="sm" variant={isExpired ? 'outline' : 'default'}>
          <CreditCard className="mr-2 h-4 w-4" />
          Renovar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
