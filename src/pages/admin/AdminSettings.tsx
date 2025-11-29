import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function AdminSettings() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({ title: 'Configurações salvas com sucesso!' })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações globais da plataforma.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geral</CardTitle>
            <CardDescription>
              Configurações básicas de funcionamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Manutenção</Label>
                <p className="text-sm text-muted-foreground">
                  Impede o acesso de usuários não administradores.
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Novos Cadastros</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita ou desabilita o registro de novos usuários.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Idioma Padrão</Label>
              <Select defaultValue="pt-BR">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configurações de envio de emails e alertas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email de Suporte</Label>
              <Input
                placeholder="suporte@smartclasshub.com"
                defaultValue="admin@smartclasshub.com"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Emails Transacionais</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar emails de boas-vindas, redefinição de senha, etc.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
