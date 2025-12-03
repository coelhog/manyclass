import { useEffect, useState } from 'react'
import { onboardingService } from '@/services/onboardingService'
import { teacherService } from '@/services/teacherService'
import { OnboardingResponse, User, OnboardingQuestion } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'

export default function AdminResponses() {
  const [responses, setResponses] = useState<OnboardingResponse[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [respData, usersData, questData] = await Promise.all([
        onboardingService.getAllResponses(),
        teacherService.getAll(),
        onboardingService.getQuestions(),
      ])
      setResponses(respData)
      setUsers(usersData)
      setQuestions(questData)
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading) return <div>Carregando...</div>

  // Group responses by User
  const usersWithResponses = users
    .map((user) => {
      const userResps = responses.filter((r) => r.userId === user.id)
      return { user, responses: userResps }
    })
    .filter((u) => u.responses.length > 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Respostas do Onboarding</h1>

      <div className="grid gap-6">
        {usersWithResponses.map(({ user, responses }) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Pergunta</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead className="w-[150px]">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((resp) => {
                    const question = questions.find(
                      (q) => q.id === resp.questionId,
                    )
                    return (
                      <TableRow key={resp.id}>
                        <TableCell className="font-medium text-muted-foreground">
                          {question?.text || 'Pergunta excluída'}
                        </TableCell>
                        <TableCell>{resp.answer}</TableCell>
                        <TableCell>
                          {format(new Date(resp.answeredAt), 'dd/MM/yyyy')}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        {usersWithResponses.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            Nenhuma resposta encontrada.
          </div>
        )}
      </div>
    </div>
  )
}
