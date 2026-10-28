import { importedCampusUsers } from '../../data/importedCampusUsers.js'
// Institutional mock data for LOCUS Admin Dashboard
// Separates mock data from presentation components so backend integration can easily replace it.

export const INITIAL_ADMIN_USERS = [
  ...importedCampusUsers,
  {
    id: 'USR-001',
    name: 'Central Estate Admin',
    email: 'admin@coeptech.ac.in',
    role: 'Administrator',
    department: 'Central Estate & Infrastructure',
    authProvider: 'Password & SSO',
    status: 'Active',
    lastActive: 'Just now',
    createdAt: '2026-08-15'
  },
  {
    id: 'USR-002',
    name: 'Dr. V. K. Kulkarni',
    email: 'faculty@coeptech.ac.in',
    role: 'Faculty',
    department: 'Computer Engineering',
    authProvider: 'Microsoft Outlook 365',
    status: 'Active',
    lastActive: '12 mins ago',
    createdAt: '2026-09-01'
  },
  {
    id: 'USR-003',
    name: 'MindSpark Secretarial Lead',
    email: 'mindspark@coeptech.ac.in',
    role: 'Club Lead',
    department: 'Technical Events Secretariat',
    authProvider: 'Email OTP',
    status: 'Active',
    lastActive: '1 hour ago',
    createdAt: '2026-09-10'
  },
  {
    id: 'USR-004',
    name: 'Aman Nirmal',
    email: 'student@coeptech.ac.in',
    role: 'Student',
    department: 'Computer Engineering',
    authProvider: 'Microsoft Outlook 365',
    status: 'Active',
    lastActive: '5 mins ago',
    createdAt: '2026-09-15'
  },
  {
    id: 'USR-005',
    name: 'Dr. S. P. Mohite',
    email: 'spm.mech@coeptech.ac.in',
    role: 'Faculty',
    department: 'Mechanical Engineering',
    authProvider: 'Password',
    status: 'Active',
    lastActive: '2 days ago',
    createdAt: '2026-09-18'
  },
  {
    id: 'USR-006',
    name: 'Robot Study Circle Lead',
    email: 'rsc.lead@coeptech.ac.in',
    role: 'Club Lead',
    department: 'Gymkhana Robotics Cell',
    authProvider: 'Email OTP',
    status: 'Active',
    lastActive: '3 hours ago',
    createdAt: '2026-09-22'
  },
  {
    id: 'USR-007',
    name: 'BHAU Incubation Officer',
    email: 'bhau.admin@coeptech.ac.in',
    role: 'Administrator',
    department: 'BHAU Entrepreneurship Institute',
    authProvider: 'Microsoft Outlook 365',
    status: 'Active',
    lastActive: 'Yesterday',
    createdAt: '2026-09-25'
  },
  {
    id: 'USR-008',
    name: 'Tanvi Joshi',
    email: 'joshit22.comp@coep.ac.in',
    role: 'Student',
    department: 'Computer Engineering',
    authProvider: 'Email OTP',
    status: 'Suspended',
    lastActive: '2 weeks ago',
    createdAt: '2026-10-02'
  }
]

export const INITIAL_ADMIN_VENUES = [
  {
    id: 'VN-1',
    code: 'ND01',
    name: 'North Drawing Hall (ND01)',
    department: 'Mechanical Engineering',
    building: 'Main Heritage Building',
    type: 'Auditorium',
    capacity: 180,
    benches: 90,
    isActive: true,
    status: 'Available', // 'Available' | 'Occupied' | 'Under Maintenance' | 'Blocked'
    description: 'Historic high-capacity hall with wooden acoustics and dual digital projection.',
    features: ['Overhead Projector', 'Public Address Mic', 'Air Conditioned', 'Tiered Seating'],
    image: '/coep_building.png'
  },
  {
    id: 'VN-2',
    code: 'NC24',
    name: 'Seminar Hall 1 (NC24)',
    department: 'Electronics and Telecommunication Engineering',
    building: 'Academic Complex West',
    type: 'Seminar Hall',
    capacity: 70,
    benches: 35,
    isActive: true,
    status: 'Available',
    description: 'Equipped for technical symposia, hybrid webinars, and robotics presentations.',
    features: ['Smart Interactive Screen', 'Sound System', 'LAN Port', 'Document Camera'],
    image: '/coep_building.png'
  },
  {
    id: 'VN-3',
    code: 'SC10',
    name: 'Seminar Hall No 1 (SC10)',
    department: 'Manufacturing Engineering and Industrial Management',
    building: 'South Complex',
    type: 'Seminar Hall',
    capacity: 90,
    benches: 45,
    isActive: true,
    status: 'Occupied',
    description: 'Large seminar facility with executive podium and high-lumen projection.',
    features: ['Projector', 'Whiteboard', 'Dual Podium', 'Live Stream Camera'],
    image: '/coep_building.png'
  },
  {
    id: 'VN-4',
    code: 'BHAU-AUD',
    name: 'BHAU Institute Main Auditorium',
    department: 'Management',
    building: 'BHAU Entrepreneurship Center',
    type: 'Auditorium',
    capacity: 250,
    benches: 125,
    isActive: true,
    status: 'Available',
    description: 'State-of-the-art auditorium for national hackathons, pitch fests, and convocations.',
    features: ['Stage Lighting', 'Dolby Acoustics', 'Central AC', 'Green Room', 'Dual Mics'],
    image: '/coep_building.png'
  },
  {
    id: 'VN-5',
    code: 'NC27',
    name: 'Computer Department Hall A (NC-27)',
    department: 'Computer Engineering',
    building: 'Computer New Building',
    type: 'Classroom',
    capacity: 80,
    benches: 40,
    isActive: true,
    status: 'Under Maintenance',
    description: 'Smart lecture hall with acoustic ceiling treatment and ceiling-mounted mics.',
    features: ['Dual HD Projectors', 'WiFi 6 Access Point', 'Surround Sound', 'Smart Whiteboard'],
    image: '/coep_building.png'
  },
  {
    id: 'VN-6',
    code: 'SC06',
    name: 'Classroom SC06 (Room No-7)',
    department: 'Civil Engineering',
    building: 'Civil Old Wing',
    type: 'Classroom',
    capacity: 60,
    benches: 30,
    isActive: true,
    status: 'Available',
    description: 'Standard lecture room for second and third year structural engineering coursework.',
    features: ['Green Board', 'Fixed Benches', 'Ceiling Fans', 'HDMI Wall Plate'],
    image: '/coep_building.png'
  },
  {
    id: 'VN-7',
    code: 'NC01',
    name: 'Lecture Hall AC 101 (NC01)',
    department: 'Academics Complex',
    building: 'New Academic Tower (Ground Floor)',
    type: 'Classroom',
    capacity: 72,
    benches: 36,
    isActive: true,
    status: 'Blocked',
    description: 'Tiered classroom reserved for institute-wide foundation courses and exams.',
    features: ['Motorized Screen', 'Dual Projectors', 'PA Microphone', 'AC'],
    image: '/coep_building.png'
  },
  {
    id: 'VN-8',
    code: 'PS01',
    name: 'Near NC-27 Passage Hall 1',
    department: 'Computer Engineering',
    building: 'Computer New Building',
    type: 'Meeting Room',
    capacity: 50,
    benches: 25,
    isActive: false,
    status: 'Under Maintenance',
    description: 'Focused collaborative discussion room for departmental clubs and committee meets.',
    features: ['Conference Table', 'Display Monitor', 'Whiteboard'],
    image: '/coep_building.png'
  }
]

export const INITIAL_ROLE_REQUESTS = [
  {
    id: 'REQ-101',
    userId: 'USR-004',
    userName: 'Aman Nirmal',
    userEmail: 'student@coeptech.ac.in',
    currentRole: 'Student',
    requestedRole: 'Club Lead',
    organization: 'MindSpark Technical Fest',
    department: 'Computer Engineering',
    justification: 'Elected as the Technical Operations Coordinator for MindSpark 2026-2027. Need authorization to reserve auditoriums and submit fest schedules.',
    proofDocumentName: 'MindSpark_Appointment_Letter_2026.pdf',
    submittedAt: '2026-10-25 14:30',
    status: 'Pending', // 'Pending' | 'Approved' | 'Rejected'
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  },
  {
    id: 'REQ-102',
    userId: 'USR-009',
    userName: 'Prof. Shraddha Deshpande',
    userEmail: 'smd.comp@coeptech.ac.in',
    currentRole: 'Student',
    requestedRole: 'Faculty',
    organization: null,
    department: 'Computer Engineering',
    justification: 'Joined COEP Technological University as Assistant Professor in Computer Engineering on 1st October 2026. Requesting Faculty role elevation for lecture booking.',
    proofDocumentName: 'Joining_Order_COEP_Oct2026.pdf',
    submittedAt: '2026-10-26 09:15',
    status: 'Pending',
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  },
  {
    id: 'REQ-103',
    userId: 'USR-010',
    userName: 'Rohan Gaikwad',
    userEmail: 'rohan.robotics@coeptech.ac.in',
    currentRole: 'Student',
    requestedRole: 'Club Lead',
    organization: 'Robot Study Circle (RSC)',
    department: 'Mechanical Engineering',
    justification: 'Appointed as Workshop Incharge for the National Autonomous Drone Challenge. Need booking rights for NC24 Seminar Hall.',
    proofDocumentName: 'RSC_Office_Bearer_Endorsement.pdf',
    submittedAt: '2026-10-24 16:45',
    status: 'Approved',
    reviewedAt: '2026-10-25 10:20',
    reviewedBy: 'admin@coeptech.ac.in',
    rejectionReason: null
  },
  {
    id: 'REQ-104',
    userId: 'USR-011',
    userName: 'Sameer Kulkarni',
    userEmail: 'sameer.guest@external.in',
    currentRole: 'Guest',
    requestedRole: 'Club Lead',
    organization: 'External Hackathon Body',
    department: 'External Affiliate',
    justification: 'Requesting permission to coordinate inter-college hackathon venue logistics.',
    proofDocumentName: 'Affiliation_Form.pdf',
    submittedAt: '2026-10-23 11:00',
    status: 'Rejected',
    reviewedAt: '2026-10-23 15:30',
    reviewedBy: 'admin@coeptech.ac.in',
    rejectionReason: 'External visitors cannot hold Club Lead roles. A COEP student office bearer or faculty coordinator must submit the reservation request.'
  }
]

export const INITIAL_TIMETABLE_ENTRIES = [
  {
    id: 'TT-001',
    title: 'CS 301: Distributed Operating Systems',
    venueCode: 'ND01',
    venueName: 'North Drawing Hall (ND01)',
    department: 'Computer Engineering',
    faculty: 'Dr. V. K. Kulkarni',
    blockType: 'Academic Schedule', // 'Academic Schedule' | 'Maintenance' | 'Examination' | 'Event Reservation' | 'Administrative Block'
    day: 'Monday',
    date: '2026-10-26',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    courseCode: 'CS301',
    classBatch: 'TY B.Tech (Div A & B)',
    semester: 'Semester V',
    academicYear: '2026-2027',
    recurrence: 'Weekly',
    recurrenceEnd: '2026-12-15',
    notes: 'Mandatory core theory lecture with lab demonstration.'
  },
  {
    id: 'TT-002',
    title: 'ME 204: Fluid Dynamics Tutorial',
    venueCode: 'SC06',
    venueName: 'Classroom SC06 (Room No-7)',
    department: 'Mechanical Engineering',
    faculty: 'Dr. S. P. Mohite',
    blockType: 'Academic Schedule',
    day: 'Monday',
    date: '2026-10-26',
    startTime: '11:15 AM',
    endTime: '01:15 PM',
    courseCode: 'ME204',
    classBatch: 'SY B.Tech (Batch M1)',
    semester: 'Semester III',
    academicYear: '2026-2027',
    recurrence: 'Weekly',
    recurrenceEnd: '2026-12-15',
    notes: 'Numerical tutorial session.'
  },
  {
    id: 'TT-003',
    title: 'Mid-Semester Examination: Applied Mathematics III',
    venueCode: 'NC01',
    venueName: 'Lecture Hall AC 101 (NC01)',
    department: 'Academics Complex',
    faculty: 'Dean Academics Examination Cell',
    blockType: 'Examination',
    day: 'Tuesday',
    date: '2026-10-27',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    courseCode: 'MA201',
    classBatch: 'All Second Year Branches',
    semester: 'Semester III',
    academicYear: '2026-2027',
    recurrence: 'None',
    recurrenceEnd: null,
    notes: 'Strict examination conditions. Hall is sealed from 09:30 AM.'
  },
  {
    id: 'TT-004',
    title: 'Projector & Acoustic Ceiling Audio Servicing',
    venueCode: 'NC27',
    venueName: 'Computer Department Hall A (NC-27)',
    department: 'Computer Engineering',
    faculty: 'Estate Maintenance Team',
    blockType: 'Maintenance',
    day: 'Wednesday',
    date: '2026-10-28',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    courseCode: null,
    classBatch: null,
    semester: null,
    academicYear: '2026-2027',
    recurrence: 'None',
    recurrenceEnd: null,
    notes: 'Vendor calibration of dual 4K laser projectors and ceiling microphone arrays.'
  },
  {
    id: 'TT-005',
    title: 'Autonomous Drone Navigation & ROS Workshop',
    venueCode: 'NC24',
    venueName: 'Seminar Hall 1 (NC24)',
    department: 'Electronics and Telecommunication Engineering',
    faculty: 'Robot Study Circle (RSC)',
    blockType: 'Event Reservation',
    day: 'Thursday',
    date: '2026-10-29',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    courseCode: null,
    classBatch: 'RSC Student Cohort',
    semester: 'Semester V',
    academicYear: '2026-2027',
    recurrence: 'None',
    recurrenceEnd: null,
    notes: 'Approved technical workshop with sensor payload flight demonstrations.'
  },
  {
    id: 'TT-006',
    title: 'E-Cell Pune Startup Pitch Fest 2026',
    venueCode: 'SC10',
    venueName: 'Seminar Hall No 1 (SC10)',
    department: 'Manufacturing Engineering and Industrial Management',
    faculty: 'BHAU Entrepreneurship Cell',
    blockType: 'Event Reservation',
    day: 'Friday',
    date: '2026-10-30',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    courseCode: null,
    classBatch: 'Campus Startups & Seed Evaluators',
    semester: 'Semester V',
    academicYear: '2026-2027',
    recurrence: 'None',
    recurrenceEnd: null,
    notes: 'High-profile investor pitch session with live hybrid streaming.'
  }
]

export const DEPARTMENTS_LIST = [
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Electronics and Telecommunication Engineering',
  'Metallurgy and Materials Science',
  'Manufacturing Engineering and Industrial Management',
  'Management',
  'Academics Complex',
  'Student Gymkhana'
]

export const VENUE_TYPES_LIST = [
  'Classroom',
  'Seminar Hall',
  'Auditorium',
  'Meeting Room',
  'Drawing Hall',
  'Lab'
]

export const BUILDINGS_LIST = [
  'Main Heritage Building',
  'Computer New Building',
  'Academic Complex West',
  'New Academic Tower',
  'South Complex',
  'Civil Old Wing',
  'Electrical Wing',
  'BHAU Entrepreneurship Center',
  'Mechanical Workshop Annex'
]


export const BLOCK_TYPES = [
  'Academic Schedule',
  'Maintenance',
  'Examination',
  'Administrative Hold',
  'Official College Activity'
]

export const BLOCK_TYPE_COLORS = {
  'Academic Schedule': {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500'
  },
  'Maintenance': {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500'
  },
  'Examination': {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500'
  },
  'Event Reservation': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500'
  },
  'Administrative Hold': {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500'
  },
  'Official College Activity': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500'
  }
}
