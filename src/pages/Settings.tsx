import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { PageTransition } from '@/components/PageTransition'
import { Link } from 'react-router-dom'
import { Blocks, ExternalLink } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <Button variant="outline" asChild>
          <Link to="/settings/integrations">
            <Blocks className="mr-2 h-4 w-4" />
            Gerenciar Integrações
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e de conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-sm">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <Button variant="outline">Alterar Foto</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="preferences"
          className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card>
            <CardHeader>
              <CardTitle>Preferências da Aplicação</CardTitle>
              <CardDescription>
                Personalize sua experiência no SmartClassHub.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações sobre suas turmas e tarefas.
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Compacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir listas com menos espaçamento.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Salvar Preferências</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="system"
          className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Conecte serviços externos como Google Calendar, Zoom e Asaas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gerencie suas conexões com ferramentas de terceiros para
                  automatizar seu fluxo de trabalho.
                </p>
                <Button variant="secondary" asChild>
                  <Link to="/settings/integrations">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Acessar Página de Integrações
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
                <CardDescription>
                  Detalhes sobre a versão atual e status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Versão:</strong> 0.0.1 (Alpha)
                  </p>
                  <p>
                    <strong>Build:</strong> 8c2a2f7
                  </p>
                  <p>
                    <strong>Ambiente:</strong> Desenvolvimento
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  )
}
