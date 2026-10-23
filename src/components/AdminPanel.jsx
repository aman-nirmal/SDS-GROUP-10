import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Users,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  RefreshCw,
  ArrowLeft,
  UserCheck,
  UserX,
  Download,
  Key,
  Shield,
  Clock
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

// Initial institutional users store
const INITIAL_USERS = [
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
  },
  {
    id: 'USR-009',
    name: 'Inspector R. S. Patil',
    email: 'security.patil@coeptech.ac.in',
    role: 'Security Guard',
    department: 'Campus Security & Gate 1 Post',
    authProvider: 'Institutional Guard PIN & SSO',
    status: 'Active',
    lastActive: 'Just now',
    createdAt: '2026-10-05'
  }
]

// Initial campus reservation requests
const INITIAL_BOOKINGS = [
  {
    id: 'COEP-BK-8950',
    venueName: 'ND01 (North Drawing Hall)',
    applicantName: 'Dr. V. K. Kulkarni',
    applicantEmail: 'faculty@coeptech.ac.in',
    applicantRole: 'Faculty',
    department: 'Computer Engineering',
    purpose: 'End-Semester Department Faculty & Research Review',
    bookingDate: '2026-10-28',
    timeSlot: '09:00 AM - 11:00 AM',
    attendees: 120,
    status: 'Confirmed',
    submittedAt: '2026-10-18 10:30 AM'
  },
  {
    id: 'COEP-BK-8951',
    venueName: 'Classroom NC24',
    applicantName: 'MindSpark Secretarial Lead',
    applicantEmail: 'mindspark@coeptech.ac.in',
    applicantRole: 'Club Lead',
    department: 'Technical Events Secretariat',
    purpose: 'MindSpark 26 Workshop: Cloud Infrastructure & AI',
    bookingDate: '2026-10-29',
    timeSlot: '02:00 PM - 05:00 PM',
    attendees: 80,
    status: 'Pending',
    submittedAt: '2026-10-21 03:45 PM'
  },
  {
    id: 'COEP-BK-8952',
    venueName: 'SC10 (South Classroom)',
    applicantName: 'Robot Study Circle Lead',
    applicantEmail: 'rsc.lead@coeptech.ac.in',
    applicantRole: 'Club Lead',
    department: 'Gymkhana Robotics Cell',
    purpose: 'Autonomous Quadcopter Flight & Telemetry Session',
    bookingDate: '2026-10-30',
    timeSlot: '04:00 PM - 07:00 PM',
    attendees: 55,
    status: 'Pending',
    submittedAt: '2026-10-22 09:15 AM'
  },
  {
    id: 'COEP-BK-8953',
    venueName: 'BHAU Institute Main Auditorium',
    applicantName: 'BHAU Incubation Officer',
    applicantEmail: 'bhau.admin@coeptech.ac.in',
    applicantRole: 'Administrator',
    department: 'BHAU Entrepreneurship Institute',
    purpose: 'Angel Investor Demo Day & Pitch Competition',
    bookingDate: '2026-11-02',
    timeSlot: '10:00 AM - 04:00 PM',
    attendees: 200,
    status: 'Confirmed',
    submittedAt: '2026-10-19 11:00 AM'
  },
  {
    id: 'COEP-BK-8954',
    venueName: 'ND02 (Drawing Hall)',
    applicantName: 'Aman Nirmal',
    applicantEmail: 'student@coeptech.ac.in',
    applicantRole: 'Student',
    department: 'Computer Engineering',
    purpose: 'Final Year Major Capstone Project Coding Session',
    bookingDate: '2026-10-25',
    timeSlot: '01:00 PM - 04:00 PM',
    attendees: 30,
    status: 'Cancelled',
    submittedAt: '2026-10-17 02:20 PM'
  }
]

// Initial campus venues list
const INITIAL_VENUES = [
  {
    id: 'VN-1',
    name: 'ND01 (North Drawing Hall)',
    department: 'General Engineering',
    type: 'Drawing Hall / Auditorium',
    capacity: 180,
    benches: 90,
    status: 'Available',
    features: ['Overhead Projector', 'Public Address Mic', 'Air Conditioned']
  },
  {
    id: 'VN-2',
    name: 'NC24 (New Classroom Complex)',
    department: 'Electronics & Telecommunication',
    type: 'Classroom',
    capacity: 80,
    benches: 40,
    status: 'Available',
    features: ['Smart Interactive Screen', 'Sound System', 'LAN Port']
  },
  {
    id: 'VN-3',
    name: 'SC10 (South Classroom Complex)',
    department: 'Mechanical Engineering',
    type: 'Classroom',
    capacity: 70,
    benches: 35,
    status: 'Occupied',
    features: ['Projector', 'Whiteboard', 'Dual Podium']
  },
  {
    id: 'VN-4',
    name: 'BHAU Institute Main Auditorium',
    department: 'BHAU Incubation',
    type: 'Auditorium',
    capacity: 250,
    benches: 125,
    status: 'Available',
    features: ['Stage Lighting', 'Dolby Acoustics', 'Central AC', 'Green Room']
  },
  {
    id: 'VN-5',
    name: 'Computer Department Seminar Hall',
    department: 'Computer Engineering',
    type: 'Seminar Hall',
    capacity: 120,
    benches: 60,
    status: 'Under Maintenance',
    features: ['Dual HD Projectors', 'WiFi 6 Access Point', 'Surround Sound']
  }
]

// Initial audit & security event logs
const INITIAL_LOGS = [
  {
    id: 'LOG-101',
    timestamp: '2026-10-22 15:45:00',
    actor: 'admin@coeptech.ac.in',
    action: 'Administrator Session Initialized',
    module: 'Authentication',
    ip: '10.1.24.88 (Campus Network)',
    severity: 'success'
  },
  {
    id: 'LOG-102',
    timestamp: '2026-10-22 15:30:12',
    actor: 'faculty@coeptech.ac.in',
    action: 'Microsoft Outlook 365 SSO Token Verified',
    module: 'Entra ID SSO',
    ip: '10.1.32.14 (Academic LAN)',
    severity: 'info'
  },
  {
    id: 'LOG-103',
    timestamp: '2026-10-22 14:15:40',
    actor: 'mindspark@coeptech.ac.in',
    action: '6-Digit Email OTP Dispatched & Verified',
    module: 'Nodemailer SMTP',
    ip: '10.1.48.201 (WiFi Staff)',
    severity: 'info'
  },
  {
    id: 'LOG-104',
    timestamp: '2026-10-22 11:20:05',
    actor: 'admin@coeptech.ac.in',
    action: 'Approved Reservation COEP-BK-8950 for ND01',
    module: 'Bookings',
    ip: '10.1.24.88 (Central Estate)',
    severity: 'success'
  },
  {
    id: 'LOG-105',
    timestamp: '2026-10-21 16:55:22',
    actor: 'joshit22.comp@coep.ac.in',
    action: 'Account Suspended due to Excessive Policy Cancellations',
    module: 'User Security',
    ip: '10.1.18.52 (Student Hostel)',
    severity: 'warning'
  }
]

export default function AdminPanel({ onBackHome, currentUser, onNavigateLogin, onQuickLogin }) {
  const [activeSubTab, setActiveSubTab] = useState('users') // 'users' | 'bookings' | 'venues' | 'logs'

  // Users state
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_users')
      return stored ? JSON.parse(stored) : INITIAL_USERS
    } catch {
      return INITIAL_USERS
    }
  })

  // Bookings state
  const [bookings, setBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_bookings')
      return stored ? JSON.parse(stored) : INITIAL_BOOKINGS
    } catch {
      return INITIAL_BOOKINGS
    }
  })

  // Venues state
  const [venuesList, setVenuesList] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_venues')
      return stored ? JSON.parse(stored) : INITIAL_VENUES
    } catch {
      return INITIAL_VENUES
    }
  })

  // Audit logs state
  const [logs, setLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_logs')
      return stored ? JSON.parse(stored) : INITIAL_LOGS
    } catch {
      return INITIAL_LOGS
    }
  })

  // Filter states
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('All')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All')
  const [bookingSearch, setBookingSearch] = useState('')

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Faculty',
    department: 'Computer Engineering'
  })

  const [notification, setNotification] = useState('')

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  // Persist users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('locus_admin_users', JSON.stringify(users))
    } catch {
      // ignore
    }
  }, [users])

  // Persist bookings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('locus_admin_bookings', JSON.stringify(bookings))
    } catch {
      // ignore
    }
  }, [bookings])

  // Persist venues to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('locus_admin_venues', JSON.stringify(venuesList))
    } catch {
      // ignore
    }
  }, [venuesList])

  // Persist logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('locus_admin_logs', JSON.stringify(logs))
    } catch {
      // ignore
    }
  }, [logs])

  // Append new audit log helper
  const addLog = useCallback((action, module = 'General', severity = 'info') => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp,
      actor: currentUser?.email || 'admin@coeptech.ac.in',
      action,
      module,
      ip: '10.1.24.88 (Campus Admin)',
      severity
    }
    setLogs((prev) => [newLog, ...prev])
  }, [currentUser])

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.department.toLowerCase().includes(userSearch.toLowerCase())
      const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter
      return matchesSearch && matchesRole
    })
  }, [users, userSearch, userRoleFilter])

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.venueName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.applicantName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.applicantEmail.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.purpose.toLowerCase().includes(bookingSearch.toLowerCase())
      const matchesStatus = bookingStatusFilter === 'All' || b.status === bookingStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, bookingSearch, bookingStatusFilter])

  // Handlers for User management
  const handleToggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active'
          addLog(
            `User ${u.email} status altered to ${nextStatus}`,
            'User Security',
            nextStatus === 'Suspended' ? 'warning' : 'success'
          )
          showNotification(`User ${u.name} is now ${nextStatus}`)
          return { ...u, status: nextStatus }
        }
        return u
      })
    )
  }

  const handleChangeUserRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addLog(`User ${u.email} role elevated to ${newRole}`, 'Access Control', 'info')
          showNotification(`Updated ${u.name}'s role to ${newRole}`)
          return { ...u, role: newRole }
        }
        return u
      })
    )
  }

  const handleDeleteUser = (userId) => {
    const target = users.find((u) => u.id === userId)
    if (!target) return
    if (window.confirm(`Are you sure you want to remove ${target.name} (${target.email}) from LOCUS?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      addLog(`Deleted campus account for ${target.email}`, 'Account Deletion', 'warning')
      showNotification(`Account ${target.email} removed.`)
    }
  }

  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      alert('Please fill out all required fields.')
      return
    }

    const trimmedEmail = newUserForm.email.trim().toLowerCase()
    if (!trimmedEmail.endsWith('@coeptech.ac.in') && !trimmedEmail.endsWith('@coep.ac.in')) {
      alert('Institutional email must end with @coeptech.ac.in or @coep.ac.in.')
      return
    }

    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      alert('A campus user with this email address already exists.')
      return
    }

    const createdUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newUserForm.name.trim(),
      email: trimmedEmail,
      role: newUserForm.role,
      department: newUserForm.department,
      authProvider: 'Microsoft Outlook 365 & Password',
      status: 'Active',
      lastActive: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setUsers((prev) => [createdUser, ...prev])
    addLog(`Manually provisioned user account for ${trimmedEmail} (${newUserForm.role})`, 'User Provisioning', 'success')
    showNotification(`New ${newUserForm.role} account created for ${createdUser.name}`)
    setIsAddUserModalOpen(false)
    setNewUserForm({
      name: '',
      email: '',
      role: 'Faculty',
      department: 'Computer Engineering'
    })
  }

  // Handlers for Booking Approvals
  const handleApproveBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          addLog(`Approved campus reservation ${b.id} for venue ${b.venueName}`, 'Bookings', 'success')
          showNotification(`Reservation ${b.id} confirmed successfully!`)
          return { ...b, status: 'Confirmed' }
        }
        return b
      })
    )
  }

  const handleRejectBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          addLog(`Rejected campus reservation ${b.id} for venue ${b.venueName}`, 'Bookings', 'warning')
          showNotification(`Reservation ${b.id} rejected.`)
          return { ...b, status: 'Cancelled' }
        }
        return b
      })
    )
  }

  // Handlers for Venues
  const handleToggleVenueStatus = (venueId) => {
    setVenuesList((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          const nextStatus = v.status === 'Available' ? 'Under Maintenance' : 'Available'
          addLog(`Venue ${v.name} status updated to ${nextStatus}`, 'Infrastructure', 'info')
          showNotification(`${v.name} is now marked ${nextStatus}`)
          return { ...v, status: nextStatus }
        }
        return v
      })
    )
  }

  // Export Users CSV
  const handleExportUsersCSV = () => {
    const headers = ['User ID', 'Full Name', 'University Email', 'Role', 'Department', 'Auth Provider', 'Status', 'Created At']
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      `"${u.department}"`,
      `"${u.authProvider}"`,
      u.status,
      u.createdAt
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `COEP_LOCUS_Users_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Users CSV export downloaded successfully!')
  }

  // Quick Stats
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      admins: users.filter((u) => u.role === 'Administrator').length,
      faculty: users.filter((u) => u.role === 'Faculty').length,
      clubLeads: users.filter((u) => u.role === 'Club Lead').length,
      students: users.filter((u) => u.role === 'Student').length,
      securityGuards: users.filter((u) => u.role === 'Security Guard').length,
      pendingBookings: bookings.filter((b) => b.status === 'Pending').length,
      confirmedBookings: bookings.filter((b) => b.status === 'Confirmed').length,
      totalVenues: venuesList.length,
      availableVenues: venuesList.filter((v) => v.status === 'Available').length
    }
  }, [users, bookings, venuesList])

  return (
    <ProtectedGate
      allowedRoles={['Administrator']}
      portalName="COEP Central Estate & Admin Console"
      portalDescription="Restricted to verified Central Estate administrators for campus-wide user provisioning, venue moderation, and security audit logs."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
      onQuickLogin={onQuickLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-700">
                  <Shield className="w-3 h-3" />
                  Admin Console
                </span>
                <span className="text-xs text-slate-400 font-medium">COEP LOCUS Central Estate</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Central Campus Administration
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleExportUsersCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                showNotification('Refreshing system telemetry...')
                setTimeout(() => showNotification('All records synced with Supabase PostgreSQL.'), 500)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-100 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Campus Users ({stats.totalUsers})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('bookings')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Reservations & Approvals</span>
            {stats.pendingBookings > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                {stats.pendingBookings}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('venues')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'venues'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Venues & Facilities ({stats.totalVenues})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'logs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Security Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI Statistics Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
              <span className="text-xs text-slate-500">accounts</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 leading-tight">
              {stats.faculty} Faculty • {stats.clubLeads} Club Leads • {stats.students} Students
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Actions</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{stats.pendingBookings}</span>
              <span className="text-xs text-slate-500">need review</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 leading-tight">
              Awaiting Central Estate approval before scheduling
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Bookings</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{stats.confirmedBookings}</span>
              <span className="text-xs text-slate-500">confirmed</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 leading-tight">
              Venues reserved across campus calendar
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Venues</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats.availableVenues} / {stats.totalVenues}</span>
              <span className="text-xs text-emerald-600 font-bold">ready</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 leading-tight">
              Classrooms, Labs & Auditoriums listed
            </p>
          </div>
        </section>

        {/* =====================================================================
            TAB 1: USERS & ROLES
            ===================================================================== */}
        {activeSubTab === 'users' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">University User Directory</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage campus identities, elevate roles, and oversee authentication privileges.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision New User</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or department..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Roles ({users.length})</option>
                  <option value="Administrator">Administrator ({stats.admins})</option>
                  <option value="Faculty">Faculty ({stats.faculty})</option>
                  <option value="Club Lead">Club Lead ({stats.clubLeads})</option>
                  <option value="Student">Student ({stats.students})</option>
                  <option value="Security Guard">Security Guard ({stats.securityGuards})</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">University Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Auth Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500">
                        No users matching "{userSearch}" found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{user.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                          {user.email}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                              user.role === 'Administrator'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : user.role === 'Faculty'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : user.role === 'Club Lead'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Administrator">Administrator</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Club Lead">Club Lead</option>
                            <option value="Student">Student</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {user.department}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          <span className="inline-flex items-center gap-1">
                            <Key className="w-3 h-3 text-slate-400" />
                            {user.authProvider}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              user.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                            title="Click to toggle account status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span>{user.status}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title={user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            >
                              {user.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 2: CAMPUS BOOKINGS & APPROVAL WORKFLOW
            ===================================================================== */}
        {activeSubTab === 'bookings' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Campus Venue Reservations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review and moderate space allocation requests submitted across student and departmental bodies.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search bookings or venues..."
                    className="h-9 pl-8 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium placeholder-slate-400 outline-none focus:border-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Status:</span>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="All">All ({bookings.length})</option>
                    <option value="Pending">Pending ({stats.pendingBookings})</option>
                    <option value="Confirmed">Confirmed ({stats.confirmedBookings})</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="divide-y divide-slate-200">
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No reservations matching current filters.
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div key={b.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">{b.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-xs font-bold text-blue-600">{b.venueName}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{b.purpose}</h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Organizer: <strong>{b.applicantName}</strong> ({b.applicantRole} • {b.department})</span>
                        <span>Date: <strong>{b.bookingDate}</strong></span>
                        <span>Time: <strong>{b.timeSlot}</strong></span>
                        <span>Expected: <strong>{b.attendees} attendees</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                      {b.status === 'Pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveBooking(b.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Venue</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectBooking(b.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : b.status === 'Confirmed' ? (
                        <button
                          type="button"
                          onClick={() => handleRejectBooking(b.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Revoke Approval
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApproveBooking(b.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 3: VENUES INVENTORY
            ===================================================================== */}
        {activeSubTab === 'venues' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Campus Facilities & Halls</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time occupancy status, capacity thresholds, and maintenance overrides.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {venuesList.map((venue) => (
                <div key={venue.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{venue.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          venue.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700'
                            : venue.status === 'Occupied'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {venue.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {venue.department} • {venue.type} • Capacity: <strong>{venue.capacity} persons</strong> ({venue.benches} benches)
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {venue.features.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleVenueStatus(venue.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                        venue.status === 'Available'
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {venue.status === 'Available' ? 'Flag for Maintenance' : 'Mark Available'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 4: SECURITY AUDIT LOGS
            ===================================================================== */}
        {activeSubTab === 'logs' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Security & Authentication Audit Trail</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable chronological records of institutional logins, OTP dispatches, and administrative actions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLogs([])
                  showNotification('Audit log records cleared.')
                }}
                className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear Log History
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">IP / Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 font-sans">
                        Audit trail is empty.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{log.actor}</td>
                        <td className="py-3 px-4 text-slate-900 font-sans font-medium">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              log.severity === 'success'
                                ? 'bg-emerald-500'
                                : log.severity === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          ></span>
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-sans">{log.module}</td>
                        <td className="py-3 px-4 text-slate-400 text-[10px]">{log.ip}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* =====================================================================
          MODAL: ADD NEW CAMPUS USER
          ===================================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Provision Campus User</h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Prof. Rajesh Sharma"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="name@coeptech.ac.in"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Club Lead">Club Lead</option>
                    <option value="Student">Student</option>
                    <option value="Security Guard">Security Guard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    placeholder="Computer Engineering"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ProtectedGate>
  )
}
