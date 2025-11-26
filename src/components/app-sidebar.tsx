import {
  Calendar,
  GraduationCap,
  Home,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  BookOpen,
  LogOut,
  CheckSquare,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Alunos',
    url: '/students',
    icon: Users,
  },
  {
    title: 'Turmas',
    url: '/classes',
    icon: GraduationCap,
  },
  {
    title: 'Calendário',
    url: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Tarefas',
    url: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Materiais',
    url: '/materials',
    icon: BookOpen,
  },
  {
    title: 'Pagamentos',
    url: '/payments',
    icon: Wallet,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { logout, user } = useAuth()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <Home className="w-5 h-5" />
          </div>
          {state === 'expanded' && <span>SmartClassHub</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-4">
          {state === 'expanded' && (
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <ModeToggle />
            {state === 'expanded' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
