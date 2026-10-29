import React, { useState, useEffect, useCallback } from 'react'
import FlyingBirds from './components/common/FlyingBirds'
import LocusLogo from './components/common/LocusLogo'
import VenueTypeCard from './components/common/VenueTypeCard'
import CustomCalendarPicker from './components/common/CustomCalendarPicker'
import VenueBookingModal from './components/modals/VenueBookingModal'
import LoginForm from './components/auth/LoginForm'
import MyBookingsPage from './pages/MyBookingsPage'
import EventsPage from './pages/EventsPage'
import VenuesPage from './pages/VenuesPage'
import {
  MapPin,
  Calendar,
  ChevronDown,
  Monitor,
  Users,
  Presentation,
  Building,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Shield,
  LogOut,
  GraduationCap,
  BookOpen,
  Trophy,
  Sun,
  Moon,
  User
} from 'lucide-react'
import UserProfileModal from './components/UserProfileModal'
import { INITIAL_ROLE_REQUESTS } from './components/admin/mockAdminData'
import About from './components/About';
import AdminPanel from './components/AdminPanel'
import GuestPortal from './components/GuestPortal'
import FacultyPortal from './components/FacultyPortal'
import StudentPortal from './components/StudentPortal'
import ClubPortal from './components/ClubPortal'
import SecurityPortal from './components/SecurityPortal'
import CampusEventNotificationPanel from './components/CampusEventNotificationPanel'

// 2-Frame Animated Flying Birds Component (Swaps bird1.png and bird2.png)
// Official LOCUS Logo Component
// Popular Venue Type Card - Equal dimensions
import { supabase } from './lib/supabase'
import { bookingsApi } from './lib/bookingsApi'
import { formatDateDisplay } from './utils/venueUtils'

// Custom Calendar Picker matching Website Design System
// Complete Interactive Venue Booking Modal Component with Full Venue Specs & Faculty In-Charge
// Interactive My Bookings Page Component
// Interactive Events Calendar View Component
// Campus Events Page Component (Auto-populated from confirmed club & college bookings)
// Coming Soon Placeholder Component
// Full Interactive & Modern Venue Catalog Page
const sampleVenuesFallback = [
  // --- New Additions: Cognizant Lab & Mini Auditorium ---
  {
    id: 'vn-cog-lab',
    code: 'COG-LAB',
    new_hall_name: 'Cognizant Lab',
    old_hall_name: 'COG-LAB (Computer Dept)',
    department: 'Computer Engineering',
    building: 'Computer New Building',
    type: 'Lab',
    benches: 200,
    capacity: 400,
    is_active: true,
    status: 'Available',
    image: '/coep_building.png',
    description: 'A computer laboratory for technical workshops, programming sessions, academic activities, and approved technical events.',
    features: ['High-End Workstations', 'LAN & High-Speed Wi-Fi', 'Smart Projectors', 'Central AC', 'Surround Sound']
  },
  {
    id: 'vn-mini-aud',
    code: 'MINI-AUD',
    new_hall_name: 'Mini Auditorium',
    old_hall_name: 'MINI-AUD (Heritage Wing)',
    department: 'Academics Complex',
    building: 'Main Heritage Building',
    type: 'Auditorium',
    benches: 138,
    capacity: 275,
    is_active: true,
    status: 'Available',
    image: '/coep_building.png',
    description: 'A mini auditorium for academic presentations, departmental events, seminars, and student activities.',
    features: ['Stage Lighting', 'Acoustic Treatment', 'Dolby Acoustics', 'Dual Mics', 'Overhead Projector', 'Central AC']
  },
  // --- Civil Engineering Classrooms ---
  {
    id: 'vn-ce-sc06',
    new_hall_name: 'SC06',
    old_hall_name: 'South Classroom 06',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Sound System']
  },
  {
    id: 'vn-ce-sc07',
    new_hall_name: 'SC07',
    old_hall_name: 'South Classroom 07',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Sound System']
  },
  {
    id: 'vn-ce-nc16',
    new_hall_name: 'NC16',
    old_hall_name: 'New Classroom Complex 16',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 45,
    capacity: 90,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Screen', 'Sound System', 'Wi-Fi 6']
  },
  {
    id: 'vn-ce-sc20',
    new_hall_name: 'SC20',
    old_hall_name: 'South Classroom 20',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Dual Podium']
  },
  {
    id: 'vn-ce-sc21',
    new_hall_name: 'SC21',
    old_hall_name: 'South Classroom 21',
    department: 'Civil Engineering',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },

  // --- Academics Complex Classrooms: NC01 - NC14 ---
  ...['NC01', 'NC02', 'NC03', 'NC04', 'NC05', 'NC06', 'NC07', 'NC08', 'NC09', 'NC10', 'NC11', 'NC12', 'NC13', 'NC14'].map((code) => ({
    id: `vn-ac-${code.toLowerCase()}`,
    new_hall_name: code,
    old_hall_name: `Academic Complex ${code}`,
    department: 'Academics Complex',
    type: 'Classrooms',
    benches: 45,
    capacity: 90,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Screen', 'Central AC', 'Motorized Screen', 'Digital Podium']
  })),

  // --- Electrical Engineering Classrooms ---
  {
    id: 'vn-ee-sc01',
    new_hall_name: 'SC01',
    old_hall_name: 'South Classroom 01',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-sc02',
    new_hall_name: 'SC02',
    old_hall_name: 'South Classroom 02',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-sc03',
    new_hall_name: 'SC03',
    old_hall_name: 'South Classroom 03',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Board', 'Audio System', 'Projector']
  },
  {
    id: 'vn-ee-st06',
    new_hall_name: 'ST06',
    old_hall_name: 'South Tutorial Hall 06',
    department: 'Electrical Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Whiteboard', 'Overhead Projector', 'Wi-Fi 6']
  },

  // --- Electronics and Telecommunication Engineering Classrooms ---
  {
    id: 'vn-entc-nc22',
    new_hall_name: 'NC22',
    old_hall_name: 'New Classroom Complex 22',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nt10',
    new_hall_name: 'NT10',
    old_hall_name: 'New Tutorial Hall 10',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Interactive Display', 'LAN Port', 'Whiteboard']
  },
  {
    id: 'vn-entc-nc23',
    new_hall_name: 'NC23',
    old_hall_name: 'New Classroom Complex 23',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nc24',
    new_hall_name: 'NC24',
    old_hall_name: 'New Classroom Complex 24',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Interactive Board', 'Air Conditioned', 'Audio System']
  },
  {
    id: 'vn-entc-nt11',
    new_hall_name: 'NT11',
    old_hall_name: 'New Tutorial Hall 11',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Interactive Screen', 'LAN Port', 'Whiteboard']
  },

  // --- Mechanical Engineering Classrooms ---
  {
    id: 'vn-me-nc18',
    new_hall_name: 'NC18',
    old_hall_name: 'New Classroom Complex 18',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc19',
    new_hall_name: 'NC19',
    old_hall_name: 'New Classroom Complex 19',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc20',
    new_hall_name: 'NC20',
    old_hall_name: 'New Classroom Complex 20',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nc21',
    new_hall_name: 'NC21',
    old_hall_name: 'New Classroom Complex 21',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-me-nt06',
    new_hall_name: 'NT06',
    old_hall_name: 'New Tutorial Hall 06',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Whiteboard', 'Overhead Projector', 'Audio System']
  },
  {
    id: 'vn-me-nd01',
    new_hall_name: 'ND01',
    old_hall_name: 'North Drawing Hall 01',
    department: 'Mechanical Engineering',
    type: 'Classrooms',
    benches: 90,
    capacity: 180,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    features: ['High-Ceiling Hall', 'Dual Projectors', 'PA Sound System']
  },

  // --- Metallurgy and Materials Science Classrooms ---
  {
    id: 'vn-mme-sc14',
    new_hall_name: 'SC14',
    old_hall_name: 'South Classroom 14',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },
  {
    id: 'vn-mme-sc15',
    new_hall_name: 'SC15',
    old_hall_name: 'South Classroom 15',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },
  {
    id: 'vn-mme-sc16',
    new_hall_name: 'SC16',
    old_hall_name: 'South Classroom 16',
    department: 'Metallurgy and Materials Science',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Overhead Projector', 'Whiteboard', 'Audio System']
  },

  // --- Management Classrooms ---
  {
    id: 'vn-mgmt-sc17',
    new_hall_name: 'SC17',
    old_hall_name: 'South Classroom 17',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },
  {
    id: 'vn-mgmt-sc18',
    new_hall_name: 'SC18',
    old_hall_name: 'South Classroom 18',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },
  {
    id: 'vn-mgmt-sc19',
    new_hall_name: 'SC19',
    old_hall_name: 'South Classroom 19',
    department: 'Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Executive Desks', 'Projection Display', 'Air Conditioned']
  },

  // --- Manufacturing Engineering and Industrial Management Classrooms ---
  {
    id: 'vn-mfg-sc10',
    new_hall_name: 'SC10',
    old_hall_name: 'South Classroom 10',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc11',
    new_hall_name: 'SC11',
    old_hall_name: 'South Classroom 11',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc12',
    new_hall_name: 'SC12',
    old_hall_name: 'South Classroom 12',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },
  {
    id: 'vn-mfg-sc13',
    new_hall_name: 'SC13',
    old_hall_name: 'South Classroom 13',
    department: 'Manufacturing Engineering and Industrial Management',
    type: 'Classrooms',
    benches: 35,
    capacity: 70,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Tiered Seating', 'Overhead Projector', 'Whiteboard']
  },

  // --- Computer New Building Classrooms ---
  {
    id: 'vn-cnb-nc27',
    new_hall_name: 'NC-27',
    old_hall_name: 'Computer New Building 27',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'Dual Displays', 'Central AC']
  },
  {
    id: 'vn-cnb-nc28',
    new_hall_name: 'NC-28',
    old_hall_name: 'Computer New Building 28',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 40,
    capacity: 80,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'Dual Displays', 'Central AC']
  },
  {
    id: 'vn-cnb-p1',
    new_hall_name: 'Near NC-27 Passage-1',
    old_hall_name: 'Computer New Building Passage Hall 01',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Projector Display', 'Whiteboard', 'Wi-Fi 6']
  },
  {
    id: 'vn-cnb-p2',
    new_hall_name: 'Near NC-27 Passage-2',
    old_hall_name: 'Computer New Building Passage Hall 02',
    department: 'Computer New Building',
    type: 'Classrooms',
    benches: 30,
    capacity: 60,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    features: ['Projector Display', 'Whiteboard', 'Wi-Fi 6']
  },

  // --- Specialized Campus Venues ---
  {
    id: 'vn-bhau-aud',
    new_hall_name: 'BHAU Aud',
    old_hall_name: 'BHAU Institute Main Auditorium',
    department: 'BHAU Institute',
    type: 'Auditoriums',
    benches: 125,
    capacity: 250,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    features: ['Acoustic Paneling', 'Stage Lighting', 'Dolby PA System']
  },
  {
    id: 'vn-comp-sh',
    new_hall_name: 'COMP SH',
    old_hall_name: 'Computer Department Seminar Hall',
    department: 'Computer Engineering',
    type: 'Seminar Halls',
    benches: 60,
    capacity: 120,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    features: ['Video Conferencing', 'Dual HD Displays', 'Central AC']
  },
  {
    id: 'vn-mr-04',
    new_hall_name: 'MR 04',
    old_hall_name: 'Main Building Meeting Room 04',
    department: 'Central Estate & Infrastructure',
    type: 'Meeting Rooms',
    benches: 12,
    capacity: 24,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    features: ['Conference Table', 'Executive Seating', 'Display Screen']
  },
  {
    id: 'vn-entc-mr',
    new_hall_name: 'ENTC MR',
    old_hall_name: 'ENTC Department Conference Room',
    department: 'Electronics and Telecommunication Engineering',
    type: 'Meeting Rooms',
    benches: 15,
    capacity: 30,
    is_active: true,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    features: ['High-speed Wi-Fi', 'HDMI Connectivity', 'Speakerphone']
  }
]

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locus-theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('locus-theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const [venues, setVenues] = useState(sampleVenuesFallback)
  const [isLoadingVenues, setIsLoadingVenues] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handlePopState = (event) => {
      const tab = event.state?.activeTab

      const validTabs = [
        'home',
        'venues',
        'events',
        'my-bookings',
        'about',
        'login',
        'guest',
        'faculty',
        'student',
        'club',
        'admin',
        'security'
      ]

      const protectedTabs = ['student', 'faculty', 'club', 'admin', 'security']
      let isAuthed = false
      try {
        isAuthed = !!localStorage.getItem('locus_auth_user')
      } catch {
        isAuthed = false
      }

      if (protectedTabs.includes(tab) && !isAuthed) {
        setActiveTab('login')
        setIsMobileMenuOpen(false)
        return
      }

      if (validTabs.includes(tab)) {
        setActiveTab(tab)
      } else {
        setActiveTab('home')
      }

      setIsMobileMenuOpen(false)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [roleRequests, setRoleRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_role_requests')
      return stored ? JSON.parse(stored) : INITIAL_ROLE_REQUESTS
    } catch {
      return INITIAL_ROLE_REQUESTS
    }
  })

  const handleUserSubmitRoleRequest = (newRequest) => {
    setRoleRequests((prev) => {
      const updated = [newRequest, ...prev]
      try {
        localStorage.setItem('locus_admin_role_requests', JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }

  const [selectedType, setSelectedType] = useState('All Venues')
  const [selectedDate, setSelectedDate] = useState('')
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null)

  const [userBookings, setUserBookings] = useState([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState(null)

  const loadUserBookings = useCallback(async (userToLoad = currentUser) => {
    if (!userToLoad || !userToLoad.email) {
      setUserBookings([])
      return
    }
    try {
      setIsLoadingBookings(true)
      setBookingsError(null)
      const data = await bookingsApi.fetchUserBookings(userToLoad)
      setUserBookings(data)
    } catch (err) {
      console.warn('[LOCUS] Error fetching user bookings:', err)
      setBookingsError(err.message || 'Could not fetch bookings')
    } finally {
      setIsLoadingBookings(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      loadUserBookings(currentUser)
    } else {
      setUserBookings([])
    }
  }, [currentUser, loadUserBookings])

  const sampleEventsFallback = [
    {
      id: 'evt-1',
      title: "MindSpark '26: 24-Hour Campus Hackathon",
      organizer: 'MindSpark Secretary',
      club_name: 'MindSpark',
      department: 'Student Gymkhana',
      category: 'Competition',
      venue_name: 'ND01',
      event_date: '2026-10-25',
      time_slot: '09:00 AM - 09:00 PM',
      expected_attendees: 180,
      description: 'Flagship hackathon with students building real-world software and hardware prototypes.',
      status: 'Confirmed'
    },
    {
      id: 'evt-2',
      title: 'Autonomous Drone Navigation & ROS Workshop',
      organizer: 'RSC Coordinator',
      club_name: 'Robot Study Circle (RSC)',
      department: 'Electronics and Telecommunication Engineering',
      category: 'Workshop',
      venue_name: 'NC24',
      event_date: '2026-10-24',
      time_slot: '02:00 PM - 05:00 PM',
      expected_attendees: 70,
      description: 'Practical workshop on Robot Operating System, LIDAR mapping, and flight controllers.',
      status: 'Confirmed'
    },
    {
      id: 'evt-3',
      title: 'E-Cell Pune Startup Pitch Fest 2026',
      organizer: 'Incubation Officer',
      club_name: 'BHAU Institute',
      department: 'Manufacturing Engineering and Industrial Management',
      category: 'Club Event',
      venue_name: 'SC10',
      event_date: '2026-10-26',
      time_slot: '10:00 AM - 01:00 PM',
      expected_attendees: 90,
      description: 'Selected student and faculty startups pitch to angel investors and industry mentors.',
      status: 'Confirmed'
    }
  ]

  const [events, setEvents] = useState(sampleEventsFallback)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)


  useEffect(() => {
    async function loadVenues() {
      if (!supabase) {
        setIsLoadingVenues(false)
        return
      }

      try {
        setIsLoadingVenues(true)
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('is_active', true)
          .order('new_hall_name', { ascending: true })

        if (error) {
          console.error('Could not fetch venues from Supabase:', error.message)
          return
        }

        if (data && data.length > 0) {
          setVenues(data)
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using fallback venues:', err)
      } finally {
        setIsLoadingVenues(false)
      }
    }

    loadVenues()
  }, [])

  useEffect(() => {
    async function loadEvents() {
      if (!supabase) return

      try {
        setIsLoadingEvents(true)
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })

        if (error) {
          console.warn('Could not fetch events from Supabase, using fallback:', error.message)
          return
        }

        if (data && data.length > 0) {
          setEvents(data)
        }
      } catch (err) {
        console.warn('Supabase events fetch failed:', err)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  const handleNavClick = (tab) => {
    const protectedTabs = ['student', 'faculty', 'club', 'admin', 'security']
    if (protectedTabs.includes(tab) && !currentUser) {
      setActiveTab('login')
      window.history.pushState({ activeTab: 'login' }, '', window.location.pathname)
      setIsMobileMenuOpen(false)
      return
    }

    if (tab === activeTab) {
      setIsMobileMenuOpen(false)
      return
    }

    window.history.pushState(
      { activeTab: tab },
      '',
      window.location.pathname
    )

    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  const handleAddBooking = async (newBooking) => {
    if (!currentUser || !['Administrator', 'Faculty', 'Club Lead', 'Club Member'].includes(currentUser.role)) {
      throw new Error('You do not have permission to book this venue. Venue reservation is restricted to Faculty, Club Leads, and Administrators.')
    }
    const saved = await bookingsApi.createBooking(newBooking, currentUser)
    setUserBookings((prev) => [saved, ...prev.filter((b) => b.ref !== saved.ref && b.id !== saved.id)])
    return saved
  }

  const handleCancelBooking = async (bookingRef) => {
    try {
      await bookingsApi.cancelBooking(bookingRef, currentUser)
      if (currentUser) {
        await loadUserBookings(currentUser)
      } else {
        setUserBookings((prev) => prev.filter((b) => b.ref !== bookingRef && b.id !== bookingRef))
      }
    } catch (err) {
      console.warn('Failed to cancel booking:', err)
    }
  }

  const venueTypes = [
    'All Venues',
    'Classrooms',
    'Seminar Halls',
    'Auditoriums',
    'Meeting Rooms',
    'Labs'
  ]

  const popularTypes = [
    {
      icon: Monitor,
      title: 'Classrooms',
      description: 'Regular lecture halls, tutorial rooms, and smart classrooms.',
      count: '42 Venues'
    },
    {
      icon: Users,
      title: 'Seminar Halls',
      description: 'Equipped for guest lectures, symposiums, and departmental workshops.',
      count: '12 Venues'
    },
    {
      icon: Presentation,
      title: 'Auditoriums',
      description: 'Large venues for campus events, cultural festivals, and annual conferences.',
      count: '4 Venues'
    },
    {
      icon: Building,
      title: 'Meeting Rooms',
      description: 'Focused spaces for club meetings, faculty discussions, and interviews.',
      count: '8 Venues'
    },
    {
      icon: Monitor,
      title: 'Labs',
      description: 'Advanced computing labs and technical workshop spaces including Cognizant Lab.',
      count: '6 Venues'
    }
  ]

  // Content router for Coming Soon tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'venues':
        return (
          <VenuesPage
            venues={venues}
            isLoading={isLoadingVenues}
            initialType={selectedType}
            initialDate={selectedDate}
            onSelectVenue={(hall) => setSelectedVenueForBooking(hall)}
            onBackHome={() => setActiveTab('home')}
          />
        )
      case 'events':
        return (
          <EventsPage
            events={events}
            isLoading={isLoadingEvents}
            onExploreVenues={() => setActiveTab('venues')}
            onBackHome={() => setActiveTab('home')}
          />
        )
      case 'my-bookings':
        return (
          <MyBookingsPage
            bookings={userBookings}
            isLoading={isLoadingBookings}
            error={bookingsError}
            onRefresh={() => loadUserBookings(currentUser)}
            onCancelBooking={handleCancelBooking}
            onBackHome={() => setActiveTab('home')}
            onExploreVenues={() => setActiveTab('venues')}
            currentUser={currentUser}
          />
        )
      case 'about':
        return (<About onBackHome={() => setActiveTab('home')} />)

      case 'login':
        return (
          <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
            <LoginForm
              onLoginSuccess={(user) => {
                if (user) {
                  setCurrentUser(user)
                  try {
                    localStorage.setItem('locus_auth_user', JSON.stringify(user))
                  } catch {
                    // ignore
                  }
                  if (user.role === 'Administrator') {
                    setActiveTab('admin')
                    return
                  } else if (user.role === 'Faculty') {
                    setActiveTab('faculty')
                    return
                  } else if (user.role === 'Club Lead') {
                    setActiveTab('club')
                    return
                  } else if (user.role === 'Student') {
                    setActiveTab('student')
                    return
                  } else if (user.role === 'Security Guard') {
                    setActiveTab('security')
                    return
                  }
                }
                setActiveTab('home')
              }}
            />
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        )
      case 'guest':
        return (
          <GuestPortal
            onNavigateLogin={() => setActiveTab('login')}
            onExploreVenues={() => setActiveTab('venues')}
          />
        )
      case 'faculty':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Faculty' || user.role === 'Administrator' ? 'faculty' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <FacultyPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'student':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Student' || user.role === 'Administrator' ? 'student' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <StudentPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'club':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Club Lead' || user.role === 'Administrator' ? 'club' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <ClubPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'admin':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Administrator' ? 'admin' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <AdminPanel
            currentUser={currentUser}
            onBackHome={() => setActiveTab('home')}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'security':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Security Guard' || user.role === 'Administrator' ? 'security' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <SecurityPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      default:
        return (
          <>
            {/* 2. Hero Section: Wide Full-Bleed Right Layout */}
            <section className="relative pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pb-14 bg-[rgb(249,248,246)] z-20">
              {/* Desktop Full-Bleed Right Image Container with subtle breathing room */}
              <div className="hidden lg:block absolute top-0 bottom-0 left-[50%] xl:left-[48%] right-0 pointer-events-none select-none z-0 pl-3 xl:pl-4 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-end">
                  {/* Subtle Circular Sky Glow behind the tower */}
                  <div className="absolute top-4 right-16 w-80 xl:w-96 aspect-square rounded-full bg-gradient-to-tr from-sky-200/50 via-sky-100/35 to-transparent pointer-events-none -z-10"></div>

                  {/* Dedicated Building + Sky Wrapper for Birds */}
                  <div className="relative flex items-center justify-end w-full h-full">
                    {/* Animated Birds flying behind the building tower */}
                    <FlyingBirds />
                    <img
                      src={theme === 'dark' ? '/coep_building_night.png' : '/coep_building.png'}
                      alt="COEP Technological University Main Building"
                      className="relative z-20 w-full h-full object-contain object-right max-h-[580px]"
                    />
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Hero Content: Anchored cleanly */}
                  <div className="lg:col-span-7 xl:col-span-6 space-y-4 sm:space-y-6 py-2 sm:py-6">
                    <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                      COEP TECHNOLOGICAL UNIVERSITY
                    </div>

                    <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                      Book Venues,<br />
                      Without the{' '}
                      <span className="relative inline-block text-blue-600 dark:text-blue-400">
                        Hassle
                        {/* Curved underline vector */}
                        <svg
                          className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 text-blue-500 overflow-visible pointer-events-none"
                          viewBox="0 0 100 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M2 9.5C24 3.5 62 1.5 98 6.5C82 10.5 45 11.5 12 10.5"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                      Find and book classrooms, seminar halls, auditoriums and other campus venues easily.
                    </p>

                    {/* Quick Search Floating Bar */}
                    <div className="pt-2">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 max-w-xl">
                        {/* Venue Type Picker */}
                        <div className="relative flex-1 w-full">
                          <button
                            type="button"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="w-full h-12 sm:h-13 px-3.5 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                              <div className="text-left">
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                  Venue Type
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {selectedType}
                                </div>
                              </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>

                          {/* Dropdown Menu */}
                          {isTypeDropdownOpen && (
                            <div className="absolute top-14 sm:top-15 left-0 w-full min-w-[200px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40">
                              {venueTypes.map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setSelectedType(type)
                                    setIsTypeDropdownOpen(false)
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${selectedType === type ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800"></div>

                        {/* Date Picker Trigger with Custom In-Website Calendar Popup */}
                        <div className="relative flex-1 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDatePickerOpen(!isDatePickerOpen)
                              setIsTypeDropdownOpen(false)
                            }}
                            className={`w-full h-12 sm:h-13 px-3.5 rounded-xl transition-colors cursor-pointer text-left flex items-center justify-between gap-2 ${isDatePickerOpen ? 'bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500/30' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <Calendar className={`w-4.5 h-4.5 shrink-0 ${selectedDate || isDatePickerOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                              <div className="text-left">
                                <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                                  Date
                                </div>
                                <div className={`text-xs truncate ${selectedDate ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {formatDateDisplay(selectedDate)}
                                </div>
                              </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          </button>

                          {/* Custom Website-Styled Calendar Dropdown */}
                          {isDatePickerOpen && (
                            <CustomCalendarPicker
                              selectedDate={selectedDate}
                              onSelectDate={(newDate) => {
                                setSelectedDate(newDate)
                                setIsDatePickerOpen(false)
                              }}
                              onClose={() => setIsDatePickerOpen(false)}
                            />
                          )}
                        </div>

                        {/* Search Button */}
                        <button
                          type="button"
                          onClick={() => handleNavClick('venues')}
                          className="w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
                        >
                          <span>Search</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Campus Stats Pills */}
                    <div className="pt-1 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">60+ Venues Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        <span>Conflict-Free Booking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        <span>Instant Request Tracking</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-Only Illustration */}
                  <div className="block lg:hidden mt-4 w-full relative overflow-hidden">
                    <FlyingBirds />
                    <img
                      src={theme === 'dark' ? '/coep_building_night.png' : '/coep_building.png'}
                      alt="COEP Technological University Main Building"
                      className="relative z-20 w-full h-auto object-contain max-h-[360px] mx-auto select-none pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Popular Venue Types Section */}
            <section className="relative z-0 pt-4 pb-12 sm:pt-6 sm:pb-14 bg-[rgb(249,248,246)] dark:bg-[#0b0f19]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                      Browse Venues
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Popular Venue Types
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('venues')}
                    className="self-start sm:self-auto group inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <span>View All Venues</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                  {popularTypes.map((type) => (
                    <div
                      key={type.title}
                      onClick={() => setSelectedVenueForBooking(type.title)}
                      className="h-full flex flex-col"
                    >
                      <VenueTypeCard
                        icon={type.icon}
                        title={type.title}
                        description={type.description}
                        count={type.count}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. How It Works Section */}
            <section className="py-12 sm:py-16 bg-[rgb(249,248,246)] dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="mb-8 sm:mb-10 text-left sm:text-left">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                    How It Works
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Book in 3 Simple Steps
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Check Availability</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Select your desired venue and inspect live open slots on the calendar.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Make a Booking</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Fill in event purpose, department, and faculty coordinator details.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Get Confirmation</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Receive approval notification and reservation slip from administration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[rgb(249,248,246)] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden transition-colors duration-300`}>
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[rgb(249,248,246)]/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div onClick={() => handleNavClick('home')}>
            <LocusLogo size="default" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'home'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'venues'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Venues
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'events'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`transition-colors cursor-pointer relative pb-1 ${activeTab === 'about'
                ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              About
            </button>

            {/* Role-Specific Portal Links - Rendered only for the user's specific role */}
            {currentUser && currentUser.role === 'Student' && (
              <button
                type="button"
                onClick={() => handleNavClick('student')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'student'
                  ? 'text-indigo-600 dark:text-indigo-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                  }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Student</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Faculty' && (
              <button
                type="button"
                onClick={() => handleNavClick('faculty')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'faculty'
                  ? 'text-blue-800 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-800 dark:after:bg-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                  }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span>Faculty</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Club Lead' && (
              <button
                type="button"
                onClick={() => handleNavClick('club')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'club'
                  ? 'text-amber-700 dark:text-amber-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-700 dark:after:bg-amber-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                  }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Club</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Security Guard' && (
              <button
                type="button"
                onClick={() => handleNavClick('security')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'security'
                  ? 'text-emerald-700 dark:text-emerald-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-700 dark:after:bg-emerald-400 font-bold'
                  : 'hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Security</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Administrator' && (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'admin'
                  ? 'text-purple-600 dark:text-purple-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 dark:after:bg-purple-400 font-bold'
                  : 'hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300'
                  }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const role = currentUser.role
                    if (role === 'Administrator') handleNavClick('admin')
                    else if (role === 'Faculty') handleNavClick('faculty')
                    else if (role === 'Club Lead') handleNavClick('club')
                    else if (role === 'Security Guard') handleNavClick('security')
                    else handleNavClick('student')
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="font-bold leading-tight">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Profile & Role Change Requests"
                  aria-label="Profile and Role Change Requests"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(null)
                    try {
                      localStorage.removeItem('locus_auth_user')
                    } catch {
                      // ignore
                    }
                    handleNavClick('home')
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick(currentUser ? 'admin' : 'login')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs"
            >
              {currentUser ? 'Console' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-[rgb(249,248,246)] dark:bg-[#0b0f19] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'home' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'venues' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Venues Catalog
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'events' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'about' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              About
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Profile & Role Requests</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Student' && (
              <button
                type="button"
                onClick={() => handleNavClick('student')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'student' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Student Portal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Faculty' && (
              <button
                type="button"
                onClick={() => handleNavClick('faculty')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'faculty' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <GraduationCap className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Faculty Portal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Club Lead' && (
              <button
                type="button"
                onClick={() => handleNavClick('club')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'club' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Club Portal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Security Guard' && (
              <button
                type="button"
                onClick={() => handleNavClick('security')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'security' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Security Terminal</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Administrator' && (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'admin' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Admin Console</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Dynamic View */}
      <main className="flex-1 flex flex-col">
        {renderTabContent()}
      </main>

      {/* Interactive Venue Reservation Modal */}
      {selectedVenueForBooking && (
        <VenueBookingModal
          venue={
            typeof selectedVenueForBooking === 'object'
              ? selectedVenueForBooking
              : venues.find(
                (v) =>
                  v.new_hall_name === selectedVenueForBooking ||
                  v.old_hall_name === selectedVenueForBooking
              ) || {
                new_hall_name: selectedVenueForBooking,
                department: 'COEP Technological University',
                benches: 30
              }
          }
          defaultDate={selectedDate}
          currentUser={currentUser}
          onClose={() => setSelectedVenueForBooking(null)}
          onSubmitBooking={async (bookingData) => {
            return await handleAddBooking(bookingData)
          }}
        />
      )}

      {/* 4. Automatic Campus Event Notification Popup */}
      <CampusEventNotificationPanel
        onNavigateToEvents={() => handleNavClick('events')}
        onSelectVenue={(venue) => setSelectedVenueForBooking(venue)}
      />

      {/* 5. Enhanced Campus Footer */}
      <footer className="mt-auto border-t border-slate-200/90 dark:border-slate-800 bg-[rgb(244,242,238)] dark:bg-[#070b12] text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80 dark:border-slate-800/80">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div onClick={() => setActiveTab('home')} className="inline-block">
                <LocusLogo />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Centralized venue reservation portal for COEP Technological University. Simplifying access to classrooms, auditoriums, and seminar halls across North and South campus.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Status: All Services Operational</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('venues')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Explore Venues
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-bookings')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    My Bookings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    About LOCUS
                  </button>
                </li>
              </ul>
            </div>

            {/* Venue Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Venues
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                {['Classrooms', 'Seminar Halls', 'Auditoriums', 'Meeting Rooms'].map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setSelectedVenueForBooking(cat)}
                      className="hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Campus & Support */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('guest')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Visitor Guidelines
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Booking Guidelines')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Booking Guidelines
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('IT Helpdesk')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    IT Helpdesk
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Privacy Policy')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Terms of Use')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 tracking-wider">LOCUS</span>
              <span>&bull;</span>
              <span>COEP Technological University &copy; 2026. All rights reserved.</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Wellesley Road, Shivajinagar, Pune - 411005, Maharashtra, India
            </div>
          </div>
        </div>
      </footer>

      {/* User Profile & Role Elevation Requests Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        roleRequests={roleRequests}
        onSubmitRequest={handleUserSubmitRoleRequest}
      />
    </div>
  )
}

