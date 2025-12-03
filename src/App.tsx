import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import Plans from './pages/Plans'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import Classes from './pages/Classes'
import ClassDetail from './pages/ClassDetail'
import CalendarPage from './pages/Calendar'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import Materials from './pages/Materials'
import Payments from './pages/Payments'
import Settings from './pages/Settings'
import Integrations from './pages/settings/Integrations'
import AutomatedMessages from './pages/AutomatedMessages'
import TeacherSchedule from './pages/TeacherSchedule'
import BookingPage from './pages/BookingPage'
import NotFound from './pages/NotFound'
import Onboarding from './pages/Onboarding'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeachersList from './pages/admin/TeachersList'
import TeacherEdit from './pages/admin/TeacherEdit'
import AdminMetrics from './pages/admin/AdminMetrics'
import AdminSettings from './pages/admin/AdminSettings'
import AdminOnboarding from './pages/admin/AdminOnboarding'
import AdminResponses from './pages/admin/AdminResponses'
import AdminClasses from './pages/admin/AdminClasses'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/book/:teacherId" element={<BookingPage />} />

            {/* Onboarding Route (Protected by AuthContext redirection in Onboarding component) */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<TeachersList />} />
              <Route path="teachers/:id" element={<TeacherEdit />} />
              <Route path="classes" element={<AdminClasses />} />
              <Route path="metrics" element={<AdminMetrics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="onboarding" element={<AdminOnboarding />} />
              <Route path="responses" element={<AdminResponses />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* App Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/:id" element={<ClassDetail />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/messages" element={<AutomatedMessages />} />
              <Route path="/schedule" element={<TeacherSchedule />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/integrations" element={<Integrations />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
