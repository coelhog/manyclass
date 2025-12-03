import { useEffect, useState } from 'react'
import { onboardingService } from '@/services/onboardingService'
import { OnboardingQuestion } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminOnboarding() {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    onboardingService.getQuestions().then((data) => {
      setQuestions(data)
      setIsLoading(false)
    })
  }, [])

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const handleAddQuestion = () => {
    const newQ: OnboardingQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      step: 1,
      text: 'Nova Pergunta',
      type: 'text',
    }
    setQuestions([...questions, newQ])
  }

  const handleDeleteQuestion = (index: number) => {
    if (confirm('Excluir esta pergunta?')) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    }
  }

  const handleSave = async () => {
    try {
      await onboardingService.saveQuestions(questions)
      toast.success('Perguntas salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar')
    }
  }

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Onboarding</h1>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  Pergunta {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteQuestion(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Texto da Pergunta</Label>
                <Input
                  value={q.text}
                  onChange={(e) =>
                    handleUpdateQuestion(index, 'text', e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Passo (Etapa)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="3"
                    value={q.step}
                    onChange={(e) =>
                      handleUpdateQuestion(
                        index,
                        'step',
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={q.type}
                    onValueChange={(v) =>
                      handleUpdateQuestion(index, 'type', v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="choice">Múltipla Escolha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {q.type === 'choice' && (
                <div className="col-span-2">
                  <Label>Opções (separadas por vírgula)</Label>
                  <Textarea
                    value={q.options?.join(', ') || ''}
                    onChange={(e) =>
                      handleUpdateQuestion(
                        index,
                        'options',
                        e.target.value.split(',').map((s) => s.trim()),
                      )
                    }
                    placeholder="Opção 1, Opção 2, Opção 3"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={handleAddQuestion}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Pergunta
        </Button>
      </div>
    </div>
  )
}
