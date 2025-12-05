-- 1. Create 'materials' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up security policies for the 'materials' bucket
-- Enable RLS on objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can upload (insert) files to 'materials' bucket
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON storage.objects;
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials');

-- Policy: Authenticated users can view (select) files from 'materials' bucket
DROP POLICY IF EXISTS "Authenticated users can view materials" ON storage.objects;
CREATE POLICY "Authenticated users can view materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'materials');

-- Policy: Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own materials" ON storage.objects;
CREATE POLICY "Users can delete own materials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'materials' AND owner = auth.uid());

-- 3. Update Admin User Role (if the user exists)
-- This attempts to set the role to 'admin' for the specified email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'contato@gecoelho.com';

