import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DateMaskInput } from '@/components/ui/date-mask-input'

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  className?: string
  placeholder?: string
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = 'Selecione uma data',
}: DatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  // Sync input value when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, 'yyyy-MM-dd'))
    } else {
      setInputValue('')
    }
  }, [date])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.length === 10) {
      const parsedDate = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(parsedDate)) {
        setDate(parsedDate)
      }
    } else if (value === '') {
      setDate(undefined)
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    // Input value will update via useEffect
    setIsCalendarOpen(false)
  }

  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <div className="relative w-full">
          <DateMaskInput
            value={inputValue}
            onChange={handleInputChange}
            className="pr-10"
            placeholder={placeholder}
            onClick={() => setIsCalendarOpen(true)}
          />
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation() // Prevent input focus logic overlap
                setIsCalendarOpen(true)
              }}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
