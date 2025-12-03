import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teacherService } from '@/services/teacherService'
import { User, PlanType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { PhoneInput } from '@/components/ui/phone-input'

export default function TeacherEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [teacher, setTeacher] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadTeacher = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await teacherService.getById(id)
        if (data) setTeacher(data)
        else {
          toast({ variant: 'destructive', title: 'Professor não encontrado' })
          navigate('/admin/teachers')
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar dados' })
      } finally {
        setIsLoading(false)
      }
    }
    loadTeacher()
  }, [id, navigate, toast])

  const handleSave = async () => {
    if (!teacher || !id) return
    setIsSaving(true)
    try {
      await teacherService.update(id, teacher)
      toast({ title: 'Dados atualizados com sucesso!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendResetPassword = () => {
    // Mock sending email
    toast({
      title: 'Email enviado',
      description: `Um link de redefinição de senha foi enviado para ${teacher?.email}`,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (!teacher) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/teachers')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Professor
          </h1>
          <p className="text-muted-foreground">
            Gerencie os dados e o plano de acesso.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Informações de contato e perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={teacher.name}
                onChange={(e) =>
                  setTeacher({ ...teacher, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={teacher.email}
                onChange={(e) =>
                  setTeacher({ ...teacher, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <PhoneInput
                value={teacher.phone || ''}
                onChange={(val) => setTeacher({ ...teacher, phone: val })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={teacher.bio || ''}
                onChange={(e) =>
                  setTeacher({ ...teacher, bio: e.target.value })
                }
                placeholder="Breve descrição..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acesso e Segurança</CardTitle>
            <CardDescription>
              Gerencie o plano e as credenciais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Plano Atual</Label>
              <Select
                value={teacher.plan_id}
                onValueChange={(v) =>
                  setTeacher({ ...teacher, plan_id: v as PlanType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                O plano define os limites de alunos e recursos disponíveis.
              </p>
            </div>

            <div className="pt-4 border-t">
              <Label className="mb-2 block">Redefinição de Senha</Label>
              <Button
                variant="outline"
                onClick={handleSendResetPassword}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Link de Redefinição
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Por segurança, não é possível alterar a senha diretamente. Um
                link será enviado ao email do professor.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
