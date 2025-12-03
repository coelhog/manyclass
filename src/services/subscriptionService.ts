import { Plan, PlanType } from '@/types'

// In a real app, this would be fetched from backend or environment
const ASAAS_PAYMENT_URL_BASE = 'https://sandbox.asaas.com/c/'

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

  // Replaced credit card processing with redirect URL generation
  getPaymentUrl: async (
    planId: PlanType,
    period: 'monthly' | 'yearly',
  ): Promise<string> => {
    // Mock Asaas Payment Link Generation
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, this would call your backend to create a payment in Asaas
        // and return the `invoiceUrl` or `paymentLink`.
        // For the prototype, we generate a mock URL.
        const mockPaymentId = Math.random().toString(36).substring(7)
        resolve(`${ASAAS_PAYMENT_URL_BASE}${mockPaymentId}`)
      }, 1000)
    })
  },
}
