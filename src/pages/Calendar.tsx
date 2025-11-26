import { CalendarContainer } from '@/components/calendar/CalendarContainer'
import { PageTransition } from '@/components/PageTransition'

export default function CalendarPage() {
  return (
    <PageTransition className="h-full flex flex-col">
      <CalendarContainer />
    </PageTransition>
  )
}
