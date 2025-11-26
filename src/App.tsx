import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import Layout from './components/Layout'
import Index from './pages/Index'
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
import NotFound from './pages/NotFound'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeachersList from './pages/admin/TeachersList'

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
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<TeachersList />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* App Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/:id" element={<ClassDetail />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
