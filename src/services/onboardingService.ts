import { OnboardingQuestion, OnboardingResponse } from '@/types'
import { db } from '@/lib/db'

const COLLECTION_QUESTIONS = 'onboarding_questions'
const COLLECTION_RESPONSES = 'onboarding_responses'

const defaultQuestions: OnboardingQuestion[] = [
  // Step 1
  {
    id: 'q1',
    step: 1,
    text: 'Qual seu principal objetivo com a plataforma?',
    type: 'choice',
    options: ['Dar aulas particulares', 'Gerenciar escola', 'Outro'],
  },
  {
    id: 'q2',
    step: 1,
    text: 'Quantos alunos você tem atualmente?',
    type: 'choice',
    options: ['0-10', '11-30', '31-50', '50+'],
  },
  {
    id: 'q3',
    step: 1,
    text: 'Você já utiliza outra plataforma?',
    type: 'choice',
    options: ['Sim', 'Não'],
  },
  // Step 2
  {
    id: 'q4',
    step: 2,
    text: 'Qual funcionalidade é mais importante para você?',
    type: 'choice',
    options: ['Agendamento', 'Pagamentos', 'Material', 'Notas'],
  },
  {
    id: 'q5',
    step: 2,
    text: 'Você pretende oferecer aulas online ou presenciais?',
    type: 'choice',
    options: ['Online', 'Presencial', 'Híbrido'],
  },
  {
    id: 'q6',
    step: 2,
    text: 'Como você gerencia seus pagamentos hoje?',
    type: 'text',
  },
  // Step 3
  {
    id: 'q7',
    step: 3,
    text: 'Você tem interesse em automações de WhatsApp?',
    type: 'choice',
    options: ['Sim', 'Não', 'Talvez'],
  },
  {
    id: 'q8',
    step: 3,
    text: 'Qual sua maior dificuldade na gestão?',
    type: 'text',
  },
  {
    id: 'q9',
    step: 3,
    text: 'Como conheceu o Manyclass?',
    type: 'choice',
    options: ['Instagram', 'Google', 'Indicação', 'Outro'],
  },
]

export const onboardingService = {
  getQuestions: async (): Promise<OnboardingQuestion[]> => {
    const questions = db.get<OnboardingQuestion>(COLLECTION_QUESTIONS)
    if (questions.length === 0) {
      db.set(COLLECTION_QUESTIONS, defaultQuestions)
      return defaultQuestions
    }
    return questions.sort((a, b) => a.step - b.step || a.id.localeCompare(b.id))
  },

  saveQuestions: async (questions: OnboardingQuestion[]): Promise<void> => {
    db.set(COLLECTION_QUESTIONS, questions)
  },

  saveResponse: async (
    userId: string,
    questionId: string,
    answer: string,
  ): Promise<void> => {
    const responses = db.get<OnboardingResponse>(COLLECTION_RESPONSES)
    const existingIndex = responses.findIndex(
      (r) => r.userId === userId && r.questionId === questionId,
    )

    const newResponse: OnboardingResponse = {
      id:
        existingIndex >= 0
          ? responses[existingIndex].id
          : Math.random().toString(36).substr(2, 9),
      userId,
      questionId,
      answer,
      answeredAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      responses[existingIndex] = newResponse
      db.set(COLLECTION_RESPONSES, responses)
    } else {
      db.insert(COLLECTION_RESPONSES, newResponse)
    }
  },

  getAllResponses: async (): Promise<OnboardingResponse[]> => {
    return db.get<OnboardingResponse>(COLLECTION_RESPONSES)
  },

  getUserResponses: async (userId: string): Promise<OnboardingResponse[]> => {
    const responses = db.get<OnboardingResponse>(COLLECTION_RESPONSES)
    return responses.filter((r) => r.userId === userId)
  },
}
