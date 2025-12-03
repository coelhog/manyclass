import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Role is now hardcoded to 'teacher' for public registration
  const role = 'teacher'
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Reset form fields on page load/access
  useEffect(() => {
    setName('')
    setEmail('')
    setPassword('')
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await register(name, email, password, role)
      toast({
        title: 'Conta de professor criada!',
        description: 'Bem-vindo ao Manyclass. Comece a gerenciar seus alunos.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: error.message || 'Tente novamente mais tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <div className="bg-primary text-primary-foreground p-2 rounded-md shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Cadastro de Professor
          </CardTitle>
          <CardDescription>
            Crie sua conta para gerenciar aulas e alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleRegister}
            className="space-y-4"
            autoComplete="off"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Cadastrar como Professor'
              )}
            </Button>
            <div className="text-center text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-4">
              É um aluno? Peça para seu professor criar sua conta.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
