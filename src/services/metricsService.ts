import { supabase } from '@/lib/supabase/client'

export interface DashboardMetrics {
  activeUsers: number
  newSignups: number
  totalRevenue: number
  tasksCompleted: number
  totalStudents: number
  totalTeachers: number
  totalClasses: number
}

export const metricsService = {
  getRealTimeMetrics: async (
    date: string = new Date().toISOString().split('T')[0],
  ): Promise<DashboardMetrics> => {
    // Fetch daily metrics
    const { data: dailyMetrics } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('date', date)
      .maybeSingle()

    // Fetch counts from tables
    const [students, teachers, classes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher'),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
    ])

    return {
      activeUsers: dailyMetrics?.active_users || 0,
      newSignups: dailyMetrics?.new_signups || 0,
      totalRevenue: dailyMetrics?.total_revenue || 0,
      tasksCompleted: dailyMetrics?.tasks_completed || 0,
      totalStudents: students.count || 0,
      totalTeachers: teachers.count || 0,
      totalClasses: classes.count || 0,
    }
  },

  // Helper to get historical data for charts
  getHistory: async (limit = 7) => {
    const { data } = await supabase
      .from('daily_metrics')
      .select('*')
      .order('date', { ascending: true })
      .limit(limit)

    return data || []
  },
}
