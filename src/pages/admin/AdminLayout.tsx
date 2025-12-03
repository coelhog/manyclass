import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Shield,
  BarChart,
  FileText,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  const navItems = [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    { title: 'Professores', url: '/admin/teachers', icon: Users },
    { title: 'Métricas', url: '/admin/metrics', icon: BarChart },
    { title: 'Onboarding', url: '/admin/onboarding', icon: FileText },
    { title: 'Respostas', url: '/admin/responses', icon: List },
    { title: 'Configurações', url: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-50 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl">
          <Shield className="w-6 h-6 text-blue-500" />
          <span>Admin Panel</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md transition-colors',
                pathname === item.url || pathname.startsWith(item.url + '/')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b px-6 flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            {navItems.find((i) => i.url === pathname)?.title || 'Admin'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name} (Super Admin)
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
