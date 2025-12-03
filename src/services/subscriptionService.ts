import { Plan, PlanType } from '@/types'

const ASAAS_SANDBOX_KEY =
  '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmVjM2ZiYjMyLTBkMTEtNDFiZi1iMjhjLTg2NGFjODk0NjJkNTo6JGFhY2hfYTZjOGRiMmMtZjQzMC00NzQ2LTk2MDAtZTRiY2JlYmY5ZGU1'

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    priceMonthly: 29.9,
    priceAnnual: 299.9, // ~16% discount
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
    priceMonthly: 59.9,
    priceAnnual: 599.9, // ~16% discount
    description: 'Para professores em crescimento',
    features: [
      'Até 50 alunos',
      'Gestão financeira',
      'Upload de materiais',
      'Integração WhatsApp',
      'Suporte prioritário',
    ],
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 99.9,
    priceAnnual: 999.9, // ~16% discount
    description: 'Para escolas e professores avançados',
    features: [
      'Alunos ilimitados',
      'Relatórios avançados',
      'Área do aluno personalizada',
      'API de integração',
      'Todas as integrações',
      'Suporte 24/7',
    ],
  },
]

export const subscriptionService = {
  getPlans: () => plans,

  processPayment: async (
    creditCard: any,
    planId: PlanType,
    period: 'monthly' | 'yearly',
  ): Promise<boolean> => {
    // Mock Asaas Payment Processing
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real implementation, we would use the ASAAS_SANDBOX_KEY to authenticate request
        // Here we just validate existence for the mock
        if (!ASAAS_SANDBOX_KEY) {
          reject(new Error('Configuração de pagamento inválida'))
          return
        }

        if (creditCard.number && creditCard.cvv && creditCard.expiry) {
          resolve(true)
        } else {
          reject(new Error('Dados do cartão inválidos'))
        }
      }, 2000)
    })
  },
}
