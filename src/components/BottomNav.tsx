import {
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Wallet,
  BookOpen,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const { pathname } = useLocation()

  const items = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Calendário', url: '/calendar', icon: Calendar },
    { title: 'Turmas', url: '/classes', icon: GraduationCap },
    { title: 'Materiais', url: '/materials', icon: BookOpen },
    { title: 'Pagamentos', url: '/payments', icon: Wallet },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = pathname === item.url
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'fill-current')}
              />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
