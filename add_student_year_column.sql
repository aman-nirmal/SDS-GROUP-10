-- ============================================================================
-- COEP LOCUS - ADD 'YEAR' COLUMN TO USERS TABLE & UPDATE STUDENTS TO 'SY'
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/ozdthbfemtuaefrrxwnm/sql
-- ============================================================================

-- 1. Add the 'year' column to the users table with default 'SY'
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS year TEXT DEFAULT 'SY';

-- 2. Ensure all existing student records are set to 'SY' (Second Year)
UPDATE public.users 
SET year = 'SY' 
WHERE role = 'Student';

-- 3. Verify the update
SELECT role, year, COUNT(*) 
FROM public.users 
GROUP BY role, year;
