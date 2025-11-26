import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Bell, User as UserIcon, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function Layout() {
  const { user, login, loginAsStudent, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    try {
      await login(email, password)
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao SmartClassHub.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: 'Verifique suas credenciais e tente novamente.',
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleStudentLogin = async () => {
    setIsLoggingIn(true)
    try {
      await loginAsStudent()
      toast({
        title: 'Login como Aluno',
        description: 'Bem-vindo ao SmartClassHub.',
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
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
            <CardTitle className="text-2xl font-bold">SmartClassHub</CardTitle>
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
                  <Button
                    variant="link"
                    className="px-0 font-normal text-xs"
                    type="button"
                  >
                    Esqueceu sua senha?
                  </Button>
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
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Entrar como Professor'
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
              <Button
                type="button"
                variant="outline"
                className="w-full transition-all hover:bg-secondary/50"
                onClick={handleStudentLogin}
                disabled={isLoggingIn}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Entrar como Aluno (Demo)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-background/50 transition-all duration-300 ease-in-out">
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="hidden md:flex relative w-64 transition-all focus-within:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-8 h-9 bg-muted/50 focus:bg-background transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted/50 rounded-full"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full animate-pulse" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs font-semibold text-primary capitalize">
                      {user.role === 'teacher' ? 'Professor' : 'Aluno'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.location.reload()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
