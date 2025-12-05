import { useAuth } from '@/contexts/AuthContext'
import Dashboard from './Dashboard'
import { Loader2 } from 'lucide-react'

export default function Index() {
  const { isLoading } = useAuth()

  // Ensure we don't render the Dashboard if still loading auth state
  // This reinforces Layout's protection
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <Dashboard />
}
