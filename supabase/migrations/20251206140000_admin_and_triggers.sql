-- Ensure admin promotion for specific email
CREATE OR REPLACE FUNCTION public.handle_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'financeiro@gecoelho.com' THEN
    UPDATE public.profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_admin_user_created ON public.profiles;
CREATE TRIGGER on_admin_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_promotion();

-- Update if the user already exists
UPDATE public.profiles SET role = 'admin' WHERE email = 'financeiro@gecoelho.com';

-- Ensure onboarding_data table has correct policies if not already
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding data" ON public.onboarding_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data" ON public.onboarding_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data" ON public.onboarding_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure materials bucket is public or handled via signed URLs (which we are doing)
-- We already have policies in previous migrations for materials.
