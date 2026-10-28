-- ============================================================================
-- COEP LOCUS VENUE RESERVATION SYSTEM - COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Execute this entire script in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Venues Table
CREATE TABLE IF NOT EXISTS public.venues (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    building TEXT DEFAULT 'Main Heritage Building',
    category TEXT DEFAULT 'Classrooms',
    type TEXT DEFAULT 'Lecture Hall',
    capacity INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Under Maintenance')),
    is_active BOOLEAN DEFAULT TRUE,
    features JSONB DEFAULT '["Projector", "Air Conditioned"]'::jsonb,
    image TEXT DEFAULT '/campus.jpeg',
    description TEXT DEFAULT 'Academic facility',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users & Institutional Directory Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Faculty', 'Club Lead', 'Administrator', 'Security Guard')),
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
    last_active TEXT DEFAULT 'Just now',
    created_at TEXT DEFAULT CURRENT_DATE::text
);

-- 4. Bookings & Reservations Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    ref TEXT UNIQUE,
    venue_id TEXT,
    venue_name TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_role TEXT NOT NULL DEFAULT 'Student',
    department TEXT NOT NULL,
    purpose TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    attendees INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Pending Sanction', 'Confirmed', 'Approved', 'Rejected', 'Cancelled')),
    priority TEXT DEFAULT 'Normal',
    notes TEXT DEFAULT '',
    decision_notes TEXT DEFAULT '',
    decided_by TEXT DEFAULT '',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for rapid overlap and conflict lookups
CREATE INDEX IF NOT EXISTS idx_bookings_conflict ON public.bookings (venue_name, date, time_slot, status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings (applicant_email);

-- 5. Role Elevation Requests Table
CREATE TABLE IF NOT EXISTS public.role_requests (
    id TEXT PRIMARY KEY,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    current_role TEXT NOT NULL DEFAULT 'Student',
    requested_role TEXT NOT NULL,
    department TEXT NOT NULL,
    justification TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewed_by TEXT DEFAULT '',
    approval_notes TEXT DEFAULT '',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Academic Timetable & Slot Blocks Table
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

-- 7. Audit Trail & Security Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL DEFAULT 'System',
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'error')),
    ip TEXT DEFAULT '127.0.0.1'
);

-- 8. Public Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow public read & authenticated/anon writes for rapid institutional setup
CREATE POLICY "Public Read Venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Public Write Venues" ON public.venues FOR ALL USING (true);

CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Write Users" ON public.users FOR ALL USING (true);

CREATE POLICY "Public Read Bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public Write Bookings" ON public.bookings FOR ALL USING (true);

CREATE POLICY "Public Read Role Requests" ON public.role_requests FOR SELECT USING (true);
CREATE POLICY "Public Write Role Requests" ON public.role_requests FOR ALL USING (true);

CREATE POLICY "Public Read Timetable" ON public.timetable FOR SELECT USING (true);
CREATE POLICY "Public Write Timetable" ON public.timetable FOR ALL USING (true);

CREATE POLICY "Public Read Audit Logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Write Audit Logs" ON public.audit_logs FOR ALL USING (true);

CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public Write Events" ON public.events FOR ALL USING (true);

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================
INSERT INTO public.venues (id, code, name, department, category, capacity, status, is_active)
VALUES
    ('VN-1', 'ND01', 'North Drawing Hall (ND01)', 'Mechanical Engineering', 'Auditorium', 180, 'Available', true),
    ('VN-2', 'LIB-DR-B', 'Central Library Discussion Room B', 'Library', 'Meeting Rooms', 12, 'Available', true),
    ('VN-3', 'COMP-LH1', 'Computer Engineering Lecture Hall 1', 'Computer Engineering', 'Classrooms', 90, 'Available', true),
    ('VN-4', 'AUD-MAIN', 'Auditorium Main Hall', 'Central Administration', 'Auditorium', 800, 'Available', true),
    ('VN-5', 'BOAT-CLUB', 'Historic Boat Club & Regatta Grounds', 'Gymkhana Sports Board', 'Outdoor & Sports', 500, 'Available', true),
    ('VN-6', 'BHAU-AUD', 'BHAU Main Auditorium', 'BHAU Institute', 'Auditorium', 300, 'Available', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, email, role, department, status)
VALUES
    ('USR-001', 'Central Estate Admin', 'admin@coeptech.ac.in', 'Administrator', 'Central Estate & Infrastructure', 'Active'),
    ('USR-002', 'Dr. V. K. Kulkarni', 'faculty@coeptech.ac.in', 'Faculty', 'Computer Engineering', 'Active'),
    ('USR-003', 'MindSpark Secretarial Lead', 'mindspark@coeptech.ac.in', 'Club Lead', 'Technical Events Secretariat', 'Active'),
    ('USR-004', 'Aman Nirmal', 'student@coeptech.ac.in', 'Student', 'Computer Engineering', 'Active'),
    ('USR-005', 'Officer S. Patil', 'security@coeptech.ac.in', 'Security Guard', 'Campus Security Office', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, title, organizer, club_name, department, venue_name, event_date, time_slot, expected_attendees, description)
VALUES
    ('evt-1', 'MindSpark ''26: 24-Hour Campus Hackathon', 'MindSpark Secretary', 'MindSpark', 'Student Gymkhana', 'ND01 (North Drawing Hall)', '2026-10-25', '09:00 AM - 09:00 PM', 180, 'Flagship hackathon with student teams building prototypes.'),
    ('evt-2', 'Autonomous Drone Navigation & ROS Workshop', 'RSC Coordinator', 'Robot Study Circle', 'Gymkhana Robotics', 'Mechanical Seminar Hall', '2026-10-27', '02:00 PM - 06:00 PM', 80, 'Hands-on hardware session covering PX4 flight controllers.')
ON CONFLICT (id) DO NOTHING;
