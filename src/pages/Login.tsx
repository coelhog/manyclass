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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

export default function Login() {
  const { login, loginWithGoogle, user, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [isForgotOpen, setIsForgotOpen] = useState(false)

  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Effect to redirect authenticated users to dashboard
  // This ensures users are not stuck on the login page
  useEffect(() => {
    if (user && !isLoading) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [user, isLoading, navigate, location])

  // Reset local loading state if auth loading finishes without a user (e.g. login error)
  useEffect(() => {
    if (!isLoading && !user) {
      setIsLoggingIn(false)
      setIsGoogleLoggingIn(false)
    }
  }, [isLoading, user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    try {
      await login(email, password)
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao Manyclass.',
      })
      // Note: isLoggingIn remains true here while AuthContext updates state.
      // The redirection effect will trigger once user is set.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error.message || 'Verifique suas credenciais.',
      })
      setIsLoggingIn(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true)
    try {
      await loginWithGoogle()
      // Redirect handled by OAuth flow
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao conectar com Google',
        description: error.message,
      })
      setIsGoogleLoggingIn(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast({ variant: 'destructive', title: 'Digite seu email' })
      return
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      })
      setIsForgotOpen(false)
      setForgotEmail('')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar email',
        description: error.message,
      })
    }
  }

  // If global loading or if user is present (about to redirect), show spinner
  // preventing the form from flashing before redirection
  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <div className="bg-primary text-primary-foreground p-2 rounded-md shadow-sm">
                <Search className="w-6 h-6" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Manyclass</CardTitle>
          <CardDescription>Faça login para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="px-0 font-normal text-xs"
                      type="button"
                    >
                      Esqueceu sua senha?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Redefinir Senha</DialogTitle>
                      <DialogDescription>
                        Digite seu email para receber um link de redefinição.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleForgotPassword}>
                        Enviar Link
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full transition-all hover:scale-[1.02]"
              disabled={isLoggingIn || isGoogleLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Entrar'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full transition-all hover:scale-[1.02] gap-2"
              disabled={isLoggingIn || isGoogleLoggingIn}
              onClick={handleGoogleLogin}
            >
              {isGoogleLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Entrar com Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>
            <div className="text-center text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
