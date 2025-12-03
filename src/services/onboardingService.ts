import { OnboardingQuestion, OnboardingResponse } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const onboardingService = {
  getQuestions: async (): Promise<OnboardingQuestion[]> => {
    const { data, error } = await supabase
      .from('onboarding_questions')
      .select('*')
      .order('step', { ascending: true })

    if (error || !data) return []

    return data
  },

  saveQuestions: async (questions: OnboardingQuestion[]): Promise<void> => {
    const { error } = await supabase.from('onboarding_questions').upsert(
      questions.map((q) => ({
        id: q.id,
        step: q.step,
        text: q.text,
        type: q.type,
        options: q.options,
      })),
    )
    if (error) throw error
  },

  saveResponse: async (
    userId: string,
    questionId: string,
    answer: string,
  ): Promise<void> => {
    // We store all responses in a single JSONB object per user in 'onboarding_data'
    // First fetch existing
    const { data: existing } = await supabase
      .from('onboarding_data')
      .select('data')
      .eq('user_id', userId)
      .single()

    const currentData = existing?.data || {}
    const newData = {
      ...currentData,
      [questionId]: { answer, answeredAt: new Date().toISOString() },
    }

    const { error } = await supabase.from('onboarding_data').upsert(
      {
        user_id: userId,
        data: newData,
      },
      { onConflict: 'user_id' },
    )

    if (error) throw error
  },

  getAllResponses: async (): Promise<OnboardingResponse[]> => {
    const { data, error } = await supabase.from('onboarding_data').select('*')

    if (error || !data) return []

    // Flatten JSONB structure to list of responses
    const responses: OnboardingResponse[] = []
    data.forEach((row: any) => {
      const userData = row.data
      if (userData) {
        Object.keys(userData).forEach((qId) => {
          responses.push({
            id: `${row.user_id}-${qId}`,
            userId: row.user_id,
            questionId: qId,
            answer: userData[qId]?.answer,
            answeredAt: userData[qId]?.answeredAt,
          })
        })
      }
    })

    return responses
  },

  getUserResponses: async (userId: string): Promise<OnboardingResponse[]> => {
    const { data } = await supabase
      .from('onboarding_data')
      .select('data')
      .eq('user_id', userId)
      .single()

    if (!data || !data.data) return []

    return Object.keys(data.data).map((qId) => ({
      id: `${userId}-${qId}`,
      userId,
      questionId: qId,
      answer: data.data[qId]?.answer,
      answeredAt: data.data[qId]?.answeredAt,
    }))
  },
}
