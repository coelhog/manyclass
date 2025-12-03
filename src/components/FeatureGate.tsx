import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PlanType } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Lock, ArrowUpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface FeatureGateProps {
  children: React.ReactNode
  requiredPlan?: PlanType
  featureName?: string
}

const PLAN_LEVELS: Record<PlanType, number> = {
  basic: 1,
  intermediate: 2,
  premium: 3,
}

export function FeatureGate({
  children,
  requiredPlan = 'basic',
  featureName = 'Esta funcionalidade',
}: FeatureGateProps) {
  const { user } = useAuth()

  if (user?.role === 'admin') return <>{children}</>
  if (user?.role === 'student') return <>{children}</> // Assume students have access for now, or implement distinct logic

  const userPlan = user?.plan_id || 'basic'
  const userLevel = PLAN_LEVELS[userPlan]
  const requiredLevel = PLAN_LEVELS[requiredPlan]

  if (userLevel >= requiredLevel) {
    return <>{children}</>
  }

  return (
    <Card className="border-dashed border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10">
      <CardHeader className="text-center">
        <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-2">
          <Lock className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle className="text-xl">Funcionalidade Premium</CardTitle>
        <CardDescription>
          {featureName} está disponível apenas no plano{' '}
          <span className="font-bold capitalize">{requiredPlan}</span> ou
          superior.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
          <Link to="/plans">
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Fazer Upgrade Agora
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
