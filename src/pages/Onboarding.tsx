import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { onboardingService } from '@/services/onboardingService'
import { OnboardingQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Plans from './Plans'

// Special Step ID for Plans
const PLAN_STEP_ID = 9999

export default function Onboarding() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [currentStepId, setCurrentStepId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [availableSteps, setAvailableSteps] = useState<number[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.onboardingCompleted) {
      navigate('/')
      return
    }

    onboardingService.getQuestions().then((data) => {
      setQuestions(data)

      // Determine available steps from questions
      const questionSteps = Array.from(
        new Set(data.map((q) => q.step).filter((s): s is number => s !== null)),
      ).sort((a, b) => a - b)

      // Add Plan Step at the end
      const steps = [...questionSteps, PLAN_STEP_ID]
      setAvailableSteps(steps)

      if (steps.length > 0) {
        setCurrentStepId(steps[0])
      }

      setIsLoading(false)
    })
  }, [user, navigate])

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = async () => {
    if (currentStepId === null) return

    // Get current step questions
    const stepQuestions = questions.filter((q) => q.step === currentStepId)

    // Validate current step
    const unanswered = stepQuestions.some((q) => !answers[q.id])
    if (unanswered) {
      toast.error('Por favor, responda todas as perguntas para continuar.')
      return
    }

    // Find next step index
    const currentIndex = availableSteps.indexOf(currentStepId)
    const nextIndex = currentIndex + 1

    if (nextIndex < availableSteps.length) {
      const nextStepId = availableSteps[nextIndex]

      // If moving to plan step, save first
      if (nextStepId === PLAN_STEP_ID) {
        setIsSaving(true)
        try {
          await Promise.all(
            Object.entries(answers).map(([qId, ans]) =>
              onboardingService.saveResponse(user!.id, qId, ans),
            ),
          )
          setCurrentStepId(nextStepId)
        } catch (error) {
          toast.error('Erro ao salvar respostas')
        } finally {
          setIsSaving(false)
        }
      } else {
        setCurrentStepId(nextStepId)
      }
    }
  }

  const handleCompleteOnboarding = async () => {
    setIsSaving(true)
    try {
      await updateUser({ onboardingCompleted: true })
      toast.success('Configuração concluída! Bem-vindo.')
      navigate('/')
    } catch (error) {
      toast.error('Erro ao finalizar')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || currentStepId === null)
    return <div className="min-h-screen bg-background" />

  const currentIndex = availableSteps.indexOf(currentStepId)
  const progress = ((currentIndex + 1) / availableSteps.length) * 100

  // Plan Step
  if (currentStepId === PLAN_STEP_ID) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Escolha seu Plano</h1>
            <p className="text-muted-foreground">
              Selecione o plano ideal para começar. Você tem um período de teste
              gratuito.
            </p>
          </div>

          <Plans
            embedded
            onPlanSelected={handleCompleteOnboarding}
            allowSkip={true}
            onSkip={handleCompleteOnboarding}
          />
        </div>
      </div>
    )
  }

  // Question Steps
  const currentQuestions = questions.filter((q) => q.step === currentStepId)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Passo {currentIndex + 1} de {availableSteps.length - 1}{' '}
              {/* Exclude plan step from count for UX */}
            </span>
            <span className="text-sm font-medium text-primary">
              Configuração Inicial
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="text-2xl pt-6">
            Vamos conhecer você melhor
          </CardTitle>
          <CardDescription>
            Responda algumas perguntas rápidas para personalizarmos sua
            experiência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          {currentQuestions.map((q) => (
            <div key={q.id} className="space-y-3 animate-in fade-in">
              <Label className="text-base">{q.text}</Label>
              {q.type === 'choice' && q.options ? (
                <RadioGroup
                  value={answers[q.id] || ''}
                  onValueChange={(v) => handleAnswer(q.id, v)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {q.options.map((opt) => (
                    <div key={opt}>
                      <RadioGroupItem
                        value={opt}
                        id={`${q.id}-${opt}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`${q.id}-${opt}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  placeholder="Sua resposta..."
                  className="h-12"
                />
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <div className="text-xs text-muted-foreground">
            * Todas as perguntas são obrigatórias
          </div>
          <Button onClick={handleNext} disabled={isSaving} className="gap-2">
            {currentIndex === availableSteps.length - 2
              ? 'Finalizar Perguntas'
              : 'Próximo'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
