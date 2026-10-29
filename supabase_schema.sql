-- ============================================================================
-- COEP LOCUS VENUE RESERVATION SYSTEM - PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Paste and run this script in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. VENUES TABLE (Classrooms, Drawing Halls, Labs, Auditoriums)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    new_hall_name TEXT,
    old_hall_name TEXT,
    department TEXT NOT NULL,
    building TEXT DEFAULT 'Main Campus',
    category TEXT DEFAULT 'Classrooms',
    type TEXT DEFAULT 'Classrooms',
    capacity INTEGER NOT NULL DEFAULT 60,
    benches INTEGER DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'Available',
    is_active BOOLEAN DEFAULT TRUE,
    features JSONB DEFAULT '["Overhead Projector", "Wi-Fi 6", "Air Conditioned"]'::jsonb,
    image TEXT DEFAULT '/photos/academic-complex-clean.jpg',
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    terms TEXT,
    address TEXT,
    faculty_incharge JSONB,
    price TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on venues
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS new_hall_name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS old_hall_name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS benches INTEGER DEFAULT 30;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '["Overhead Projector", "Wi-Fi 6", "Air Conditioned"]'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '/photos/academic-complex-clean.jpg';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS faculty_incharge JSONB;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_venues_code ON public.venues (code);
CREATE INDEX IF NOT EXISTS idx_venues_dept ON public.venues (department);

-- ============================================================================
-- 3. USERS TABLE (Students, Faculty, HOD, Dean, Club Leads, Security Guards)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student',
    department TEXT NOT NULL DEFAULT 'Computer Engineering',
    year TEXT DEFAULT 'SY',
    club_name TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    auth_provider TEXT DEFAULT 'credentials',
    is_active BOOLEAN DEFAULT TRUE,
    last_active TEXT DEFAULT 'Just now',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS year TEXT DEFAULT 'SY';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS club_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'credentials';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active TEXT DEFAULT 'Just now';

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Student',
    department TEXT DEFAULT 'Computer Engineering',
    year TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. BOOKINGS TABLE (Multi-Tier Governance, QR Gate Passes, Cashfree PG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref TEXT UNIQUE,
    venue_id TEXT,
    venue_name TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    user_role TEXT NOT NULL DEFAULT 'Student',
    department TEXT NOT NULL,
    club_name TEXT,
    booking_type TEXT DEFAULT 'Workshop',
    event_title TEXT,
    purpose TEXT NOT NULL,
    description TEXT,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    attendees INTEGER NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'Pending',
    priority TEXT DEFAULT 'Normal',
    pass_code TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    faculty_remarks TEXT,
    gate_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by TEXT,
    hod_approval JSONB,
    dean_approval JSONB,
    lab_assistant_approval JSONB,
    payment_status TEXT DEFAULT 'Free',
    paid_amount NUMERIC DEFAULT 0,
    payment_id TEXT,
    payment_gateway TEXT,
    cf_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_ref TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS venue_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'Workshop';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'Student';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS club_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 50;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS expected_attendees INTEGER DEFAULT 50;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pass_code TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS faculty_remarks TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS gate_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS hod_approval JSONB;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS dean_approval JSONB;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS lab_assistant_approval JSONB;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Free';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_gateway TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cf_order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_conflict ON public.bookings (venue_name, booking_date, time_slot, status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings (applicant_email);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON public.bookings (booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_pass_code ON public.bookings (pass_code);

-- ============================================================================
-- 5. ROLE REQUESTS TABLE (Promotion to Faculty / Club Lead / Lab Assistant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.role_requests (
    id TEXT PRIMARY KEY DEFAULT ('REQ-' || floor(random() * 900000 + 100000)::text),
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    "current_role" TEXT NOT NULL DEFAULT 'Student',
    requested_role TEXT NOT NULL,
    department TEXT NOT NULL,
    justification TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    reviewed_by TEXT,
    approval_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_role_requests_email ON public.role_requests (applicant_email);

-- ============================================================================
-- 6. TIMETABLE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.timetable (
    id TEXT PRIMARY KEY,
    venue_id TEXT,
    venue_name TEXT NOT NULL,
    title TEXT NOT NULL,
    course_code TEXT DEFAULT 'CS301',
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    faculty_name TEXT NOT NULL,
    semester TEXT DEFAULT 'B.Tech Sem VI',
    department TEXT DEFAULT 'Computer Engineering',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timetable_venue_day ON public.timetable (venue_name, day_of_week);

-- ============================================================================
-- 7. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('LOG-' || floor(random() * 900000 + 100000)::text),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL DEFAULT 'System',
    severity TEXT NOT NULL DEFAULT 'info',
    ip TEXT DEFAULT '127.0.0.1'
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);

-- ============================================================================
-- 8. CAMPUS EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT ('evt-' || floor(random() * 9000 + 1000)::text),
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    club_name TEXT,
    department TEXT,
    category TEXT DEFAULT 'Technical',
    venue_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    expected_attendees INTEGER DEFAULT 100,
    description TEXT,
    status TEXT DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (event_date);

-- ============================================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies with Safe Existence Checks
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'venues' AND policyname = 'Venues Access Policy') THEN
        CREATE POLICY "Venues Access Policy" ON public.venues FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users Access Policy') THEN
        CREATE POLICY "Users Access Policy" ON public.users FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles Access Policy') THEN
        CREATE POLICY "Profiles Access Policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Bookings Access Policy') THEN
        CREATE POLICY "Bookings Access Policy" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'role_requests' AND policyname = 'Role Requests Access Policy') THEN
        CREATE POLICY "Role Requests Access Policy" ON public.role_requests FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timetable' AND policyname = 'Timetable Access Policy') THEN
        CREATE POLICY "Timetable Access Policy" ON public.timetable FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Audit Logs Access Policy') THEN
        CREATE POLICY "Audit Logs Access Policy" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Events Access Policy') THEN
        CREATE POLICY "Events Access Policy" ON public.events FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
