import { Outlet, useLocation, Navigate, Link } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Bell, Loader2, CreditCard } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { BottomNav } from './BottomNav'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Layout() {
  const { user, logout, isLoading } = useAuth()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      {!isMobile && <AppSidebar />}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-background/50 transition-all duration-300 ease-in-out pb-16 md:pb-0">
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {!isMobile && <SidebarTrigger />}
            {isMobile && (
              <span className="font-bold text-lg text-primary">
                SmartClassHub
              </span>
            )}
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/settings">Meu Perfil</Link>
                </DropdownMenuItem>
                {user.role === 'teacher' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/plans">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Meu Plano
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/settings">Configurações</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
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
      <BottomNav />
    </SidebarProvider>
  )
}
