-- ==============================================================================
-- LOCUS (Location Orchestration & Centralized University Spaces)
-- COEP Technological University Venue Booking System
-- Database Migration: Full Schema Setup with Row Level Security (RLS)
-- Supabase Project URL: https://ozdthbfemtuaefrrxwnm.supabase.co
-- ==============================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE 1: venues
-- Campus lecture halls, drawing halls, auditoriums, labs, and seminar rooms
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.venues (
    id TEXT PRIMARY KEY,
    code TEXT,
    new_hall_name TEXT NOT NULL,
    old_hall_name TEXT,
    department TEXT NOT NULL,
    building TEXT,
    type TEXT NOT NULL DEFAULT 'Classrooms',
    benches INTEGER DEFAULT 30,
    capacity INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'Available',
    description TEXT,
    image TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was previously created with an older schema
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS new_hall_name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS old_hall_name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS building TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Classrooms';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS benches INTEGER DEFAULT 30;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 60;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS faculty_incharge TEXT;

-- Index on venue lookup and active status
CREATE INDEX IF NOT EXISTS idx_venues_active ON public.venues (is_active);
CREATE INDEX IF NOT EXISTS idx_venues_type ON public.venues (type);
CREATE INDEX IF NOT EXISTS idx_venues_dept ON public.venues (department);
CREATE INDEX IF NOT EXISTS idx_venues_code ON public.venues (code);

-- Seed core university venues including Cognizant Lab and Mini Auditorium
INSERT INTO public.venues (
    id, code, new_hall_name, old_hall_name, department, building,
    type, benches, capacity, is_active, status, description, features, image
)
VALUES
    (
        'vn-cog-lab',
        'COG-LAB',
        'Cognizant Lab',
        'COG-LAB (Computer Dept)',
        'Computer Engineering',
        'Computer New Building',
        'Lab',
        200,
        400,
        true,
        'Available',
        'A computer laboratory for technical workshops, programming sessions, academic activities, and approved technical events.',
        '["High-End Workstations", "LAN & High-Speed Wi-Fi", "Dual Smart Projectors", "Central AC", "Surround Audio"]'::jsonb,
        '/coep_building.png'
    ),
    (
        'vn-mini-aud',
        'MINI-AUD',
        'Mini Auditorium',
        'MINI-AUD (Heritage Wing)',
        'Academics Complex',
        'Main Heritage Building',
        'Auditorium',
        138,
        275,
        true,
        'Available',
        'A mini auditorium for academic presentations, departmental events, seminars, and student activities.',
        '["Stage Lighting", "Acoustic Treatment", "Dolby Acoustics", "Dual Mics", "Overhead Projector", "Central AC"]'::jsonb,
        '/coep_building.png'
    ),
    (
        'VN-1',
        'ND01',
        'North Drawing Hall (ND01)',
        'ND01 Main Hall',
        'Mechanical Engineering',
        'Main Heritage Building',
        'Auditorium',
        90,
        180,
        true,
        'Available',
        'Historic high-capacity hall with wooden acoustics and dual digital projection.',
        '["Overhead Projector", "Public Address Mic", "Air Conditioned", "Tiered Seating"]'::jsonb,
        '/coep_building.png'
    ),
    (
        'VN-4',
        'BHAU-AUD',
        'BHAU Institute Main Auditorium',
        'BHAU Auditorium',
        'Management',
        'BHAU Entrepreneurship Center',
        'Auditorium',
        125,
        250,
        true,
        'Available',
        'State-of-the-art auditorium for national hackathons, pitch fests, and convocations.',
        '["Stage Lighting", "Dolby Acoustics", "Central AC", "Green Room", "Dual Mics"]'::jsonb,
        '/coep_building.png'
    )
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    new_hall_name = EXCLUDED.new_hall_name,
    department = EXCLUDED.department,
    building = EXCLUDED.building,
    type = EXCLUDED.type,
    capacity = EXCLUDED.capacity,
    benches = EXCLUDED.benches,
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- ==============================================================================
-- TABLE 2: events
-- Confirmed campus events auto-synced across academic departments and clubs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organizer TEXT,
    club_name TEXT,
    department TEXT,
    category TEXT DEFAULT 'College Event',
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
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'College Event';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS expected_attendees INTEGER DEFAULT 50;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Confirmed';

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_club ON public.events (club_name);

-- Seed today's sample events (including Cognizant Lab AI Workshop)
INSERT INTO public.events (
    id, title, organizer, club_name, department, category, venue_name, event_date, time_slot, expected_attendees, description, status
)
VALUES
    (
        'evt-today-ai-workshop',
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
        'evt-today-academics-seminar',
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

-- ==============================================================================
-- TABLE 3: clubs
-- Official COEP Gymkhana clubs and authorized lead identities
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    lead_email VARCHAR(255) NOT NULL,
    department VARCHAR(255) DEFAULT 'Student Gymkhana',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clubs_name ON public.clubs (name);
CREATE INDEX IF NOT EXISTS idx_clubs_lead_email ON public.clubs (lead_email);

-- Seed core university clubs
INSERT INTO public.clubs (name, lead_email, department, description)
VALUES 
    ('MindSpark', 'mindspark@coeptech.ac.in', 'Technical Events Secretariat', 'COEP National Flagship Technical Symposium'),
    ('ZEST', 'zest@coeptech.ac.in', 'Sports Secretariat', 'Annual Inter-Engineering National Sports Carnival'),
    ('Robot Study Circle (RSC)', 'rsc@coeptech.ac.in', 'Electronics and Telecommunication Engineering', 'National Robotics Championship & Autonomous Systems Team'),
    ('BHAU Institute', 'bhau@coeptech.ac.in', 'Entrepreneurship & Incubation', 'COEP Center for Innovation, Incubation and Entrepreneurship')
ON CONFLICT (name) DO UPDATE 
SET lead_email = EXCLUDED.lead_email,
    department = EXCLUDED.department,
    description = EXCLUDED.description;

-- ==============================================================================
-- TABLE 4: users
-- Campus identities across Student, Faculty, Club Lead, Admin, and Security roles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Student',
    department VARCHAR(255),
    club_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_club ON public.users (club_name);

-- Seed official institutional test & admin profiles
INSERT INTO public.users (id, email, name, role, department, club_name)
VALUES
    ('ADM-001', 'admin@coeptech.ac.in', 'Central Estate Admin', 'Administrator', 'Central Estate & Infrastructure', NULL),
    ('FAC-1042', 'faculty@coeptech.ac.in', 'Dr. V. K. Kulkarni', 'Faculty', 'Computer Engineering', NULL),
    ('CLUB-MS-26', 'mindspark@coeptech.ac.in', 'MindSpark Secretarial Lead', 'Club Lead', 'Technical Events Secretariat', 'MindSpark'),
    ('STU-2026-101', 'student@coeptech.ac.in', 'Aman Nirmal', 'Student', 'Computer Engineering', NULL),
    ('SEC-G1-04', 'security@coeptech.ac.in', 'Officer S. Patil', 'Security Guard', 'Campus Security & Gate 1 Control', NULL)
ON CONFLICT (email) DO UPDATE 
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    club_name = EXCLUDED.club_name,
    updated_at = now();

-- ==============================================================================
-- TABLE 5: bookings
-- Central database storage for all campus venue reservations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(100),
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL DEFAULT 'Student',
    department VARCHAR(255),
    club_name VARCHAR(100),
    venue_id VARCHAR(100),
    venue_name VARCHAR(255) NOT NULL,
    old_venue_name VARCHAR(255),
    booking_date DATE NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    attendees INTEGER DEFAULT 1 CHECK (attendees > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed' 
        CHECK (status IN ('Pending', 'Confirmed', 'Approved', 'Rejected', 'Cancelled', 'Under Review')),
    faculty_in_charge VARCHAR(255),
    digital_pass_code VARCHAR(100),
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all booking columns exist if table was previously created with an older schema
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_ref VARCHAR(50);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'Student';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS club_name VARCHAR(100);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS venue_id VARCHAR(100);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS old_venue_name VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time_slot VARCHAR(100);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 1;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Confirmed';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS faculty_in_charge VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS digital_pass_code VARCHAR(100);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS special_requirements TEXT;

-- Crucial Query Indexes for fast account-specific retrieval and pass validation
CREATE INDEX IF NOT EXISTS idx_bookings_applicant_email ON public.bookings (applicant_email);
CREATE INDEX IF NOT EXISTS idx_bookings_club_name ON public.bookings (club_name);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON public.bookings (booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_pass_code ON public.bookings (digital_pass_code);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON public.bookings (created_at DESC);

-- Prevent overlapping confirmed bookings for the same venue, date, and time slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_venue_active_booking
ON public.bookings (venue_name, booking_date, time_slot)
WHERE status IN ('Confirmed', 'Approved');

-- Automated Timestamp Update Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- SEED INITIAL SAMPLE BOOKINGS (Preserves historical test records)
-- ==============================================================================
INSERT INTO public.bookings (
    booking_ref, user_id, applicant_name, applicant_email, user_role, department, club_name, 
    venue_name, old_venue_name, booking_date, time_slot, purpose, attendees, status, 
    faculty_in_charge, digital_pass_code
)
VALUES
    (
        'LOCUS-482910', 'FAC-1042', 'Prof. Aniket Joshi', 'faculty@coeptech.ac.in', 'Faculty', 
        'Computer Engineering', NULL, 'NC01', 'AC 101', '2026-10-18', '09:00 AM - 11:00 AM', 
        'End-Sem Project Viva & Evaluation', 72, 'Confirmed', 'Dr. V. K. Kulkarni', 'COEP-FAC-9912-KEY'
    ),
    (
        'STU-BK-902', 'STU-2026-101', 'Aman Nirmal', 'student@coeptech.ac.in', 'Student', 
        'Computer Engineering', NULL, 'Central Library Discussion Room B', NULL, '2026-10-24', '02:00 PM - 04:00 PM', 
        'Final Year Capstone Project Coding', 4, 'Approved', 'Dr. V. K. Kulkarni', 'COEP-LIB-8849-PASS'
    ),
    (
        'CLB-BK-401', 'CLUB-MS-26', 'MindSpark Secretarial Lead', 'mindspark@coeptech.ac.in', 'Club Lead', 
        'Technical Events Secretariat', 'MindSpark', 'BHAU Main Auditorium', NULL, '2026-10-28', '08:00 AM - 06:00 PM', 
        'MindSpark ''26: National Tech Symposium Keynote', 280, 'Approved', 'Prof. Central Dean', 'COEP-CLB-7721-FEST'
    ),
    (
        'FAC-BK-101', 'FAC-1042', 'Dr. V. K. Kulkarni', 'faculty@coeptech.ac.in', 'Faculty', 
        'Computer Engineering', NULL, 'ND01 (North Drawing Hall)', NULL, '2026-10-28', '09:00 AM - 11:00 AM', 
        'End-Semester Department Research & Capstone Viva', 120, 'Confirmed', 'Dr. V. K. Kulkarni', 'COEP-FAC-9912-KEY'
    ),
    (
        'CLB-BK-505', 'CLUB-MS-26', 'MindSpark Secretarial Lead', 'mindspark@coeptech.ac.in', 'Club Lead',
        'Technical Events Secretariat', 'MindSpark', 'Cognizant Lab', 'COG-LAB', '2026-10-28', '02:00 PM - 05:00 PM',
        'AI Workshop: Hands-on Deep Learning & Edge Models', 150, 'Approved', 'Dr. V. K. Kulkarni', 'COEP-CLB-9932-PASS'
    )
ON CONFLICT (booking_ref) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict access control enforced on Supabase PostgreSQL engine
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 2. Venues & Events: Public read access for active spaces
DROP POLICY IF EXISTS "Public can view active venues" ON public.venues;
CREATE POLICY "Public can view active venues" ON public.venues
    FOR SELECT USING (is_active = true OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
CREATE POLICY "Admins can manage venues" ON public.venues
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role = 'Administrator')
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Public can view confirmed events" ON public.events;
CREATE POLICY "Public can view confirmed events" ON public.events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clubs and Admins can manage events" ON public.events;
CREATE POLICY "Clubs and Admins can manage events" ON public.events
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role IN ('Administrator', 'Club Lead'))
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Public can view clubs" ON public.clubs;
CREATE POLICY "Public can view clubs" ON public.clubs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.users;
CREATE POLICY "Users can view own profile or admins can view all" ON public.users
    FOR SELECT USING (
        email = (auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') IN (SELECT u.email FROM public.users u WHERE u.role = 'Administrator')
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

DROP POLICY IF EXISTS "Service role and backend can upsert users" ON public.users;
CREATE POLICY "Service role and backend can upsert users" ON public.users
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Bookings Access Control Policies
-- Rule A: Reading bookings
DROP POLICY IF EXISTS "Scoped read access for bookings" ON public.bookings;
CREATE POLICY "Scoped read access for bookings" ON public.bookings
    FOR SELECT USING (
        auth.role() = 'service_role'
        OR applicant_email = (auth.jwt() ->> 'email')
        OR (auth.jwt() ->> 'email') IN (
            SELECT email FROM public.users WHERE role IN ('Administrator', 'Security Guard')
        )
        OR (
            club_name IS NOT NULL AND club_name IN (
                SELECT c.name FROM public.clubs c 
                WHERE c.lead_email = (auth.jwt() ->> 'email')
            )
        )
        OR auth.role() = 'anon'
    );

-- Rule B: Inserting bookings (Only authorized roles allowed: Administrator, Faculty, Club Lead, Club Member)
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

-- Rule C: Updating booking status
DROP POLICY IF EXISTS "Authorized update of bookings" ON public.bookings;
CREATE POLICY "Authorized update of bookings" ON public.bookings
    FOR UPDATE USING (
        auth.role() = 'service_role'
        OR (auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role = 'Administrator')
        OR (
            club_name IS NOT NULL AND club_name IN (
                SELECT c.name FROM public.clubs c WHERE c.lead_email = (auth.jwt() ->> 'email')
            )
        )
        OR (applicant_email = (auth.jwt() ->> 'email') AND status = 'Cancelled')
        OR auth.role() = 'anon'
    )
    WITH CHECK (
        length(booking_ref) >= 5
    );

-- Rule D: Deleting/Cancelling bookings
DROP POLICY IF EXISTS "Authorized deletion of bookings" ON public.bookings;
CREATE POLICY "Authorized deletion of bookings" ON public.bookings
    FOR DELETE USING (
        auth.role() = 'service_role'
        OR (auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role = 'Administrator')
        OR applicant_email = (auth.jwt() ->> 'email')
        OR auth.role() = 'anon'
    );

-- Grant appropriate permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venues TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.events TO anon, authenticated;
GRANT SELECT ON public.clubs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
