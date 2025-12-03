-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'teacher',
  avatar TEXT,
  bio TEXT,
  plan_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to sync auth.users with profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar, plan_id, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'teacher') = 'teacher' THEN 'basic' ELSE NULL END,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, public.profiles.avatar);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Platform Courses (Admin Content)
CREATE TABLE IF NOT EXISTS public.platform_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schedule TEXT,
  days INTEGER[], -- Array of days 0-6
  start_time TEXT,
  duration INTEGER,
  status TEXT DEFAULT 'active',
  billing_model TEXT,
  price NUMERIC,
  category TEXT,
  student_limit INTEGER,
  meet_link TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class Students (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.class_students (
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  custom_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  color TEXT,
  tags JSONB, -- Array of tags
  options JSONB, -- Array of options for multiple choice
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Submissions
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  selected_option_id TEXT,
  grade NUMERIC,
  feedback TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Data (Flexible JSONB)
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Onboarding Questions
CREATE TABLE IF NOT EXISTS public.onboarding_questions (
  id TEXT PRIMARY KEY,
  step INTEGER,
  text TEXT,
  type TEXT,
  options TEXT[]
);

-- Materials
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Access (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.material_access (
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (material_id, student_id)
);

-- Integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id TEXT NOT NULL, -- 'google_calendar', etc
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT,
  status TEXT DEFAULT 'disconnected',
  config JSONB DEFAULT '{}'::JSONB,
  connected_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, integration_id)
);

-- Teacher Schedules
CREATE TABLE IF NOT EXISTS public.teacher_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  availability JSONB DEFAULT '[]'::JSONB,
  booking_duration INTEGER DEFAULT 60,
  booking_link_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated Messages
CREATE TABLE IF NOT EXISTS public.automated_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  type TEXT,
  template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  timing TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  type TEXT,
  color TEXT,
  student_ids UUID[], -- Simple array for now, or could be relation
  is_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class Notes
CREATE TABLE IF NOT EXISTS public.class_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID, -- Could reference events if persistent
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics (for Admin)
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  active_users INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  new_signups INTEGER DEFAULT 0
);

-- Enable RLS (Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
-- Add policies as needed (Permissive for now for functionality)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for all users" ON public.platform_courses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.classes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable select for authenticated users" ON public.classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.classes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.classes FOR DELETE USING (auth.role() = 'authenticated');

-- Seed Data for Admin if not exists (handled by trigger usually, but specialized roles might need manual update)
