import { Check } from 'lucide-react'
import { DAYS } from '@/lib/constants'
import { TeacherSchedule } from '@/types'

interface ScheduleGridProps {
  schedule: TeacherSchedule | null
  onToggleSlot: (dayIndex: number, hour: number) => void
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

export function ScheduleGrid({ schedule, onToggleSlot }: ScheduleGridProps) {
  const isSlotActive = (dayIndex: number, hour: number) => {
    if (!schedule) return false
    const startTime = `${hour.toString().padStart(2, '0')}:00`
    return schedule.availability.some(
      (s) => s.dayOfWeek === dayIndex && s.startTime === startTime,
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="font-bold text-center py-2 text-sm">Horário</div>
          {DAYS.map((day) => (
            <div
              key={day.value}
              className="font-bold text-center py-2 bg-muted/30 rounded-md text-sm"
            >
              {day.label}
            </div>
          ))}
        </div>

        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              {hour}:00
            </div>
            {DAYS.map((day) => {
              const active = isSlotActive(day.value, hour)
              return (
                <div
                  key={`${day.value}-${hour}`}
                  onClick={() => onToggleSlot(day.value, hour)}
                  className={`
                    h-10 rounded-md border flex items-center justify-center cursor-pointer transition-all
                    ${
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'hover:bg-accent hover:border-accent-foreground/20 bg-card'
                    }
                  `}
                >
                  {active && <Check className="h-4 w-4" />}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
