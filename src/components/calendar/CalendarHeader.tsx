import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CalendarHeaderProps {
  currentDate: Date
  view: 'month' | 'week'
  onViewChange: (view: 'month' | 'week') => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSearch: (term: string) => void
  onAddEvent: () => void
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onSearch,
  onAddEvent,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold capitalize min-w-[200px]">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h1>
        <div className="flex items-center rounded-md border bg-background shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            className="h-8 w-8 rounded-r-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="h-8 rounded-none border-x px-3 font-normal"
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-8 w-8 rounded-l-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-8 h-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Select
          value={view}
          onValueChange={(v) => onViewChange(v as 'month' | 'week')}
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={onAddEvent} className="h-9">
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>
    </div>
  )
}
