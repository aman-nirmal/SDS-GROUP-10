-- ============================================================================
-- COEP LOCUS — Security Setup SQL
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================================

-- 1. Add password column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Seed all institutional test accounts with proper roles
--    In production, replace plaintext passwords with bcrypt hashes
INSERT INTO public.users (id, name, email, role, department, password, is_active, auth_provider)
VALUES
  ('ADM-001',      'Central Estate Admin',       'admin@coeptech.ac.in',          'Administrator',              'Central Estate & Infrastructure',      'Password@123', true, 'credentials'),
  ('HOD-CIVIL-01', 'Dr. Balkrishna M. Dawari',   'hod.civil@coeptech.ac.in',      'Head of Department (HOD)',   'Civil Engineering',                    'Password@123', true, 'credentials'),
  ('HOD-COMP-01',  'Dr. V. K. Pachghare',        'hod.comp@coeptech.ac.in',       'Head of Department (HOD)',   'Computer Engineering',                 'Password@123', true, 'credentials'),
  ('DEAN-ACAD-01', 'Dr. P. R. Dhamangaonkar',    'dean.academics@coeptech.ac.in', 'Dean',                       'Office of the Dean (Academics)',        'Password@123', true, 'credentials'),
  ('FAC-1042',     'Dr. V. K. Kulkarni',         'faculty@coeptech.ac.in',        'Faculty',                    'Computer Engineering',                 'Password@123', true, 'credentials'),
  ('CLUB-MS-26',   'MindSpark Secretarial Lead', 'mindspark@coeptech.ac.in',      'Club Lead',                  'Technical Events Secretariat',         'Password@123', true, 'credentials'),
  ('STU-2026-101', 'Aman Nirmal',                'student@coeptech.ac.in',        'Student',                    'Computer Engineering',                 'Password@123', true, 'credentials'),
  ('SEC-G1-04',    'Officer S. Patil',           'security@coeptech.ac.in',       'Security Guard',             'Campus Security & Gate 1 Control',     'Password@123', true, 'credentials')
ON CONFLICT (email) DO UPDATE SET
  password   = EXCLUDED.password,
  role       = EXCLUDED.role,
  name       = EXCLUDED.name,
  department = EXCLUDED.department,
  is_active  = EXCLUDED.is_active;

-- 3. Verify the seed worked
SELECT id, name, email, role, department, is_active FROM public.users ORDER BY role;
