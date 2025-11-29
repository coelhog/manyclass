import { useState, useEffect, useCallback } from 'react'
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  setHours,
  setMinutes,
  differenceInMinutes,
  addMinutes,
} from 'date-fns'
import { CalendarEvent, CreateEventDTO } from '@/types'
import { classService } from '@/services/classService'
import { CalendarHeader } from './CalendarHeader'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { ClassModal } from './ClassModal'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export function CalendarContainer() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(
    undefined,
  )

  const { toast } = useToast()

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await classService.getEvents()
      setEvents(data)
      setFilteredEvents(data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar eventos',
        description: 'Não foi possível conectar ao servidor.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEvents(filtered)
  }, [searchTerm, events])

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subDays(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleEventClick = (event: CalendarEvent) => {
    // Prevent editing auto-generated class events for now, or handle them differently
    if (event.id.startsWith('auto-')) {
      toast({
        title: 'Evento Automático',
        description: 'Gerado a partir da agenda da turma.',
      })
      return
    }
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleDateClick = (date: Date, hour?: number) => {
    const newDate = new Date(date)
    if (hour !== undefined) {
      newDate.setHours(hour)
    }
    setModalInitialDate(newDate)
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (data: CreateEventDTO) => {
    try {
      if (selectedEvent) {
        await classService.updateEvent({ ...data, id: selectedEvent.id })
        toast({ title: 'Evento atualizado com sucesso!' })
      } else {
        await classService.createEvent(data)
        toast({ title: 'Evento criado com sucesso!' })
      }
      await loadEvents()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar evento',
        description: 'Tente novamente mais tarde.',
      })
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await classService.deleteEvent(id)
      toast({ title: 'Evento excluído com sucesso!' })
      await loadEvents()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir evento',
        description: 'Tente novamente mais tarde.',
      })
    }
  }

  const handleEventDrop = async (
    eventId: string,
    date: Date,
    hour?: number,
  ) => {
    if (eventId.startsWith('auto-')) return // Cannot move auto events

    const event = events.find((e) => e.id === eventId)
    if (!event) return

    const oldStart = new Date(event.start_time)
    const oldEnd = new Date(event.end_time)
    const duration = differenceInMinutes(oldEnd, oldStart)

    let newStart = new Date(date)
    if (hour !== undefined) {
      newStart = setHours(newStart, hour)
      newStart = setMinutes(newStart, oldStart.getMinutes())
    } else {
      // Keep original time if dropped in month view (just change date)
      newStart = setHours(newStart, oldStart.getHours())
      newStart = setMinutes(newStart, oldStart.getMinutes())
    }

    const newEnd = addMinutes(newStart, duration)

    try {
      // Optimistic update
      const updatedEvent = {
        ...event,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      }
      setEvents(events.map((e) => (e.id === eventId ? updatedEvent : e)))

      await classService.updateEvent({
        id: eventId,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      })
      toast({ title: 'Evento reagendado!' })
    } catch (error) {
      // Revert on error
      await loadEvents()
      toast({
        variant: 'destructive',
        title: 'Erro ao mover evento',
      })
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onSearch={setSearchTerm}
        onAddEvent={() => {
          setSelectedEvent(null)
          setModalInitialDate(new Date())
          setIsModalOpen(true)
        }}
      />

      <div className="flex-1 min-h-[600px]">
        {isLoading ? (
          <div className="grid grid-cols-7 gap-4 h-full">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : view === 'month' ? (
          <MonthView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
          />
        ) : view === 'week' ? (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
          />
        ) : (
          <DayView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
          />
        )}
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        initialDate={modalInitialDate}
      />
    </div>
  )
}
