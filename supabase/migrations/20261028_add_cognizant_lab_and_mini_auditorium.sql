-- ==============================================================================
-- LOCUS (Location Orchestration & Centralized University Spaces)
-- COEP Technological University Venue Booking System
-- Migration: Add Cognizant Lab & Mini Auditorium with Role-Based RLS and Conflict Prevention
-- Compatible with: UUID/TEXT ids, Generated/Normal capacity columns, Supabase RLS
-- ==============================================================================

-- 1. Ensure public.venues exists and has all required columns
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT,
    new_hall_name TEXT,
    old_hall_name TEXT,
    name TEXT,
    department TEXT,
    building TEXT,
    type TEXT DEFAULT 'Classrooms',
    benches INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'Available',
    description TEXT,
    image TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    faculty_incharge TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Defensively add any missing columns to existing tables
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS new_hall_name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS old_hall_name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS building TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Classrooms';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS benches INTEGER DEFAULT 30;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS faculty_incharge TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Clean up any prior temporary entries for these codes if inserted under different IDs
DELETE FROM public.venues 
WHERE code IN ('COG-LAB', 'MINI-AUD') 
  AND id NOT IN ('c091ab01-0000-4000-8000-000000000001', 'a0d10002-0000-4000-8000-000000000002');

-- 2. Idempotently insert or update the two new venues
-- NOTE: "capacity" is deliberately omitted from column list because in PostgreSQL schemas
-- where capacity is defined as a GENERATED ALWAYS AS (benches * 2) STORED column,
-- inserting into it directly causes error 428C9. Supplying benches (200 & 138) automatically
-- generates the exact required capacities (400 for Cognizant Lab, 276 for Mini Auditorium).
INSERT INTO public.venues (
    id, code, new_hall_name, old_hall_name, name, department, building,
    type, benches, is_active, status, description, features, image
)
VALUES
    (
        'c091ab01-0000-4000-8000-000000000001',
        'COG-LAB',
        'Cognizant Lab',
        'COG-LAB (Computer Dept)',
        'Cognizant Lab',
        'Computer Engineering',
        'Computer New Building',
        'Lab',
        200,
        true,
        'Available',
        'A computer laboratory for technical workshops, programming sessions, academic activities, and approved technical events.',
        '["High-End Workstations", "LAN & High-Speed Wi-Fi", "Dual Smart Projectors", "Central AC", "Surround Audio"]'::jsonb,
        '/coep_building.png'
    ),
    (
        'a0d10002-0000-4000-8000-000000000002',
        'MINI-AUD',
        'Mini Auditorium',
        'MINI-AUD (Heritage Wing)',
        'Mini Auditorium',
        'Academics Complex',
        'Main Heritage Building',
        'Auditorium',
        138,
        true,
        'Available',
        'A mini auditorium for academic presentations, departmental events, seminars, and student activities.',
        '["Stage Lighting", "Acoustic Treatment", "Dolby Acoustics", "Dual Mics", "Overhead Projector", "Central AC"]'::jsonb,
        '/coep_building.png'
    )
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    new_hall_name = EXCLUDED.new_hall_name,
    old_hall_name = EXCLUDED.old_hall_name,
    name = EXCLUDED.name,
    department = EXCLUDED.department,
    building = EXCLUDED.building,
    type = EXCLUDED.type,
    benches = EXCLUDED.benches,
    is_active = EXCLUDED.is_active,
    status = EXCLUDED.status,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    image = EXCLUDED.image;

-- If capacity happens to be a regular column (NOT a generated column), set exact values
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'venues' 
          AND column_name = 'capacity' 
          AND is_generated = 'NEVER'
    ) THEN
        UPDATE public.venues SET capacity = 400 WHERE id = 'c091ab01-0000-4000-8000-000000000001';
        UPDATE public.venues SET capacity = 275 WHERE id = 'a0d10002-0000-4000-8000-000000000002';
    END IF;
END $$;

-- 3. Ensure public.bookings exists and prevent overlapping confirmed bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref TEXT UNIQUE,
    applicant_name TEXT,
    applicant_email TEXT,
    department TEXT,
    club_name TEXT,
    venue_name TEXT,
    purpose TEXT,
    event_type TEXT,
    booking_date DATE,
    time_slot TEXT,
    attendees INTEGER,
    status TEXT DEFAULT 'Confirmed',
    pass_code TEXT,
    is_approved BOOLEAN DEFAULT true,
    faculty_remarks TEXT,
    gate_verified BOOLEAN DEFAULT false,
    user_role TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_ref TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS applicant_email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS club_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendees INTEGER;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Confirmed';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pass_code TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS faculty_remarks TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS gate_verified BOOLEAN DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_role TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_venue_active_booking
ON public.bookings (venue_name, booking_date, time_slot)
WHERE status IN ('Confirmed', 'Approved');

-- 4. Ensure events table exists and seed sample today's event
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organizer TEXT,
    club_name TEXT,
    department TEXT,
    category TEXT DEFAULT 'Campus Event',
    venue_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    expected_attendees INTEGER DEFAULT 50,
    description TEXT,
    status TEXT DEFAULT 'Confirmed',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS club_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Campus Event';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS expected_attendees INTEGER DEFAULT 50;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Confirmed';

INSERT INTO public.events (
    id, title, organizer, club_name, department, category, venue_name, event_date, time_slot, expected_attendees, description, status
)
VALUES
    (
        'e0000001-0000-4000-8000-000000000001',
        'AI Workshop: Deep Learning on Edge Devices',
        'Club Lead - MindSpark',
        'MindSpark',
        'Computer Engineering',
        'Technical Workshop',
        'Cognizant Lab',
        CURRENT_DATE,
        '02:00 PM - 05:00 PM',
        150,
        'Hands-on workshop on generative AI, tensor computing, and computer vision models held in Cognizant Lab.',
        'Confirmed'
    ),
    (
        'e0000002-0000-4000-8000-000000000002',
        'Faculty Research & Innovation Colloquium',
        'Dean Academics',
        NULL,
        'Academics Complex',
        'Academic Presentation',
        'Mini Auditorium',
        CURRENT_DATE,
        '10:00 AM - 01:00 PM',
        180,
        'Departmental symposium and research presentations in Mini Auditorium.',
        'Confirmed'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    venue_name = EXCLUDED.venue_name,
    event_date = EXCLUDED.event_date,
    time_slot = EXCLUDED.time_slot,
    status = EXCLUDED.status;

-- 5. Ensure users table exists for role-based RLS resolution
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student',
    department TEXT,
    club_name TEXT,
    phone TEXT,
    auth_provider TEXT DEFAULT 'email-password',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Student';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS club_name TEXT;

-- 6. Strict Role-Based Row Level Security (RLS) Policy for Booking Creation
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authorized users can insert valid bookings" ON public.bookings;
CREATE POLICY "Authorized users can insert valid bookings" ON public.bookings
    FOR INSERT WITH CHECK (
        length(booking_ref) >= 5
        AND length(applicant_name) > 0
        AND length(applicant_email) > 0
        AND length(venue_name) > 0
        AND length(purpose) > 0
        AND booking_date IS NOT NULL
        AND attendees > 0
        AND (
            auth.role() = 'service_role'
            OR user_role IN ('Administrator', 'Faculty', 'Club Lead', 'Club Member')
            OR (auth.jwt() ->> 'email') IN (
                SELECT email FROM public.users WHERE role IN ('Administrator', 'Faculty', 'Club Lead', 'Club Member')
            )
            OR applicant_email IN (
                SELECT email FROM public.users WHERE role IN ('Administrator', 'Faculty', 'Club Lead', 'Club Member')
            )
        )
    );

-- 7. Ensure read policy on venues allows viewing active venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active venues" ON public.venues;
CREATE POLICY "Public can view active venues" ON public.venues
    FOR SELECT USING (is_active = true OR auth.role() = 'service_role');

-- 8. Grant table access to anon and authenticated roles
GRANT ALL ON public.venues TO anon, authenticated, service_role;
GRANT ALL ON public.bookings TO anon, authenticated, service_role;
GRANT ALL ON public.events TO anon, authenticated, service_role;
GRANT ALL ON public.users TO anon, authenticated, service_role;
