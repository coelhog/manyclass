-- 1. Add created_by column to profiles to track student creation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 2. Update handle_new_user trigger to populate created_by from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar, plan_id, onboarding_completed, created_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'teacher') = 'teacher' THEN 'basic' ELSE NULL END,
    FALSE,
    (NEW.raw_user_meta_data->>'created_by')::uuid
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, public.profiles.avatar),
    created_by = COALESCE(EXCLUDED.created_by, public.profiles.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Helper function for Storage RLS (User-specific access for PDFs)
CREATE OR REPLACE FUNCTION public.storage_can_read_file(bucket_id text, name text)
RETURNS boolean AS $$
DECLARE
  owner_id text;
BEGIN
  -- Allow access to other buckets if any
  IF bucket_id <> 'materials' THEN RETURN true; END IF;
  
  -- Extract owner (teacher_id) from path "teacher_id/filename"
  owner_id := (split_part(name, '/', 1));
  
  -- Admin access
  IF (SELECT public.is_admin()) THEN RETURN true; END IF;
  
  -- Owner access (Teacher)
  IF owner_id = auth.uid()::text THEN RETURN true; END IF;
  
  -- Student access (Check material_access table)
  -- We check if the current user is a student who has access to a material owned by this teacher
  -- Note: This is a simplified check. Ideally we match the exact file, but file paths aren't strictly enforced in DB.
  -- We assume trust in the teacher_id part of the path matching the material owner.
  RETURN EXISTS (
    SELECT 1 
    FROM public.material_access ma
    JOIN public.materials m ON m.id = ma.material_id
    WHERE ma.student_id = auth.uid()
    AND m.teacher_id::text = owner_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Make materials bucket private
UPDATE storage.buckets SET public = false WHERE id = 'materials';

-- 6. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_courses ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.platform_courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.classes;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.classes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.classes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.classes;

-- 8. Create RLS Policies

-- PROFILES
CREATE POLICY "Admins full access on profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Teachers view created students" ON public.profiles FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Teachers view students in classes" ON public.profiles FOR SELECT TO authenticated USING (
  id IN (
    SELECT cs.student_id 
    FROM public.class_students cs 
    JOIN public.classes c ON c.id = cs.class_id 
    WHERE c.teacher_id = auth.uid()
  )
);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- AUTOMATED MESSAGES
CREATE POLICY "Admins full access on messages" ON public.automated_messages FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users manage own messages" ON public.automated_messages FOR ALL TO authenticated USING (user_id = auth.uid());

-- CLASSES
CREATE POLICY "Admins full access on classes" ON public.classes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage own classes" ON public.classes FOR ALL TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Students view enrolled classes" ON public.classes FOR SELECT TO authenticated USING (
  id IN (SELECT class_id FROM public.class_students WHERE student_id = auth.uid())
);

-- CLASS STUDENTS
CREATE POLICY "Admins full access on class_students" ON public.class_students FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage class students" ON public.class_students FOR ALL TO authenticated USING (
  class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
);
CREATE POLICY "Students view own enrollments" ON public.class_students FOR SELECT TO authenticated USING (student_id = auth.uid());

-- TASKS
CREATE POLICY "Admins full access on tasks" ON public.tasks FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage own tasks" ON public.tasks FOR ALL TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Students view assigned tasks" ON public.tasks FOR SELECT TO authenticated USING (
  student_id = auth.uid() 
  OR class_id IN (SELECT class_id FROM public.class_students WHERE student_id = auth.uid())
);

-- TASK SUBMISSIONS
CREATE POLICY "Admins full access on submissions" ON public.task_submissions FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Students manage own submissions" ON public.task_submissions FOR ALL TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Teachers view submissions for their tasks" ON public.task_submissions FOR SELECT TO authenticated USING (
  task_id IN (SELECT id FROM public.tasks WHERE teacher_id = auth.uid())
);
CREATE POLICY "Teachers grade submissions" ON public.task_submissions FOR UPDATE TO authenticated USING (
  task_id IN (SELECT id FROM public.tasks WHERE teacher_id = auth.uid())
);

-- MATERIALS
CREATE POLICY "Admins full access on materials" ON public.materials FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage own materials" ON public.materials FOR ALL TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Students view accessible materials" ON public.materials FOR SELECT TO authenticated USING (
  id IN (SELECT material_id FROM public.material_access WHERE student_id = auth.uid())
);

-- MATERIAL ACCESS
CREATE POLICY "Admins full access on material_access" ON public.material_access FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage material access" ON public.material_access FOR ALL TO authenticated USING (
  material_id IN (SELECT id FROM public.materials WHERE teacher_id = auth.uid())
);
CREATE POLICY "Students view own access" ON public.material_access FOR SELECT TO authenticated USING (student_id = auth.uid());

-- EVENTS
CREATE POLICY "Admins full access on events" ON public.events FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage own events" ON public.events FOR ALL TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Students view own events" ON public.events FOR SELECT TO authenticated USING (
  auth.uid() = ANY(student_ids)
);

-- PAYMENTS
CREATE POLICY "Admins full access on payments" ON public.payments FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Students view own payments" ON public.payments FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Teachers view student payments" ON public.payments FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.profiles WHERE created_by = auth.uid())
  OR student_id IN (
    SELECT cs.student_id 
    FROM public.class_students cs 
    JOIN public.classes c ON c.id = cs.class_id 
    WHERE c.teacher_id = auth.uid()
  )
);
CREATE POLICY "Teachers insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE created_by = auth.uid())
  OR student_id IN (
    SELECT cs.student_id 
    FROM public.class_students cs 
    JOIN public.classes c ON c.id = cs.class_id 
    WHERE c.teacher_id = auth.uid()
  )
);

-- INTEGRATIONS
CREATE POLICY "Admins full access on integrations" ON public.integrations FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users manage own integrations" ON public.integrations FOR ALL TO authenticated USING (user_id = auth.uid());

-- TEACHER SCHEDULES
CREATE POLICY "Admins full access on schedules" ON public.teacher_schedules FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage own schedules" ON public.teacher_schedules FOR ALL TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Public view schedules" ON public.teacher_schedules FOR SELECT TO anon, authenticated USING (true);

-- ONBOARDING DATA
CREATE POLICY "Admins full access on onboarding" ON public.onboarding_data FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users manage own onboarding" ON public.onboarding_data FOR ALL TO authenticated USING (user_id = auth.uid());

-- CLASS NOTES
CREATE POLICY "Admins full access on notes" ON public.class_notes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Teachers manage own notes" ON public.class_notes FOR ALL TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Students view own notes" ON public.class_notes FOR SELECT TO authenticated USING (student_id = auth.uid());

-- PLATFORM COURSES
CREATE POLICY "Admins manage courses" ON public.platform_courses FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users view active courses" ON public.platform_courses FOR SELECT TO authenticated USING (is_active = true);

-- 9. Storage Policies (Replaces previous permissive policies)
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own materials" ON storage.objects;
DROP POLICY IF EXISTS "Teachers upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users read materials" ON storage.objects;

CREATE POLICY "Teachers upload materials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'materials' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users read materials" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'materials' AND public.storage_can_read_file(bucket_id, name)
);

CREATE POLICY "Teachers delete own materials" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'materials' AND (storage.foldername(name))[1] = auth.uid()::text
);
