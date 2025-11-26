import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PageTransition } from '@/components/PageTransition'
import { Badge } from '@/components/ui/badge'

export default function Plans() {
  const { user } = useAuth()

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 29,90',
      description: 'Para professores iniciantes',
      features: [
        'Até 10 alunos',
        'Gestão de turmas básica',
        'Calendário simples',
      ],
    },
    {
      id: 'intermediate',
      name: 'Intermediário',
      price: 'R$ 59,90',
      description: 'Para professores em crescimento',
      features: [
        'Até 50 alunos',
        'Gestão financeira',
        'Upload de materiais',
        'Suporte prioritário',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 99,90',
      description: 'Para escolas e professores avançados',
      features: [
        'Alunos ilimitados',
        'Relatórios avançados',
        'Área do aluno personalizada',
        'API de integração',
        'Suporte 24/7',
      ],
    },
  ]

  return (
    <PageTransition className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Planos e Preços</h1>
        <p className="text-xl text-muted-foreground">
          Escolha o plano ideal para sua jornada de ensino.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 pt-8">
        {plans.map((plan) => {
          const isCurrent = user?.plan_id === plan.id
          return (
            <Card
              key={plan.id}
              className={`flex flex-col relative ${
                isCurrent ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground">
                    Plano Atual
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-3xl font-bold mb-6">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mês
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
                >
                  {isCurrent ? 'Seu Plano' : 'Assinar Agora'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </PageTransition>
  )
}
