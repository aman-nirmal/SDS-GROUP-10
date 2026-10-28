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
  UserCheck,
  UserX,
  Download,
  Key,
  Clock,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  ArrowLeft
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'
import { bookingsApi } from '../lib/bookingsApi'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import AdminVenues from './admin/AdminVenues'
import RoleRequests from './admin/RoleRequests'
import AdminTimetable from './admin/AdminTimetable'
import {
  INITIAL_ADMIN_VENUES,
  INITIAL_ROLE_REQUESTS,
  INITIAL_TIMETABLE_ENTRIES
} from './admin/mockAdminData'

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

// Initial audit & security event logs// Initial audit & security event logs
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

export default function AdminPanel({ onBackHome, currentUser, onNavigateLogin }) {
  const [activeSubTab, setActiveSubTab] = useState('users') // 'users' | 'bookings' | 'venues' | 'logs'
  const [expandedBookingIds, setExpandedBookingIds] = useState(new Set())

  const toggleExpandBooking = (id) => {
    setExpandedBookingIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

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

  // Synchronize bookings with Supabase database
  useEffect(() => {
    async function loadAdminBookings() {
      try {
        const data = await bookingsApi.fetchUserBookings({
          role: 'Administrator',
          email: currentUser?.email || 'admin@coeptech.ac.in'
        })

        if (data && data.length > 0) {
          setBookings(data)
        }
      } catch (err) {
        console.warn(
          '[AdminPanel] Could not fetch bookings from Supabase:',
          err
        )
      }
    }

    loadAdminBookings()
  }, [currentUser])

  // Approvals view toggle ('bookings' | 'role_requests')
  const [approvalsView, setApprovalsView] = useState('bookings')

  // Venues state
  const [venuesList, setVenuesList] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_venues')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingCodes = new Set(parsed.map((v) => v.code || v.id))
          const missingInitial = INITIAL_ADMIN_VENUES.filter(
            (v) => !existingCodes.has(v.code) && !existingCodes.has(v.id)
          )
          return [...missingInitial, ...parsed]
        }
      }
      return INITIAL_ADMIN_VENUES
    } catch {
      return INITIAL_ADMIN_VENUES
    }
  })

  // Synchronize venues from Supabase database
  useEffect(() => {
    async function loadSupabaseVenues() {
      if (supabase && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('venues')
            .select('*')
            .order('new_hall_name', { ascending: true })

          if (!error && data && data.length > 0) {
            const mapped = data.map((v) => ({
              id: v.id,
              code: v.code || v.old_hall_name || v.id,
              name: v.new_hall_name,
              department: v.department,
              building: v.building || 'Campus Complex',
              type: v.type || 'Auditorium',
              capacity: v.capacity || (v.benches ? v.benches * 2 : 60),
              benches: v.benches || Math.round((v.capacity || 60) / 2),
              isActive: v.is_active !== false,
              status: v.status || (v.is_active ? 'Available' : 'Blocked'),
              description: v.description || '',
              features: Array.isArray(v.features) ? v.features : [],
              image: v.image || '/coep_building.png'
            }))
            setVenuesList(mapped)
          }
        } catch (err) {
          console.warn('[AdminPanel] Could not sync venues from Supabase:', err)
        }
      }
    }
    loadSupabaseVenues()
  }, [])

  // Role change requests state
  const [roleRequests, setRoleRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_role_requests')
      return stored ? JSON.parse(stored) : INITIAL_ROLE_REQUESTS
    } catch {
      return INITIAL_ROLE_REQUESTS
    }
  })

  // Timetable schedules & physical blocks state
  const [timetable, setTimetable] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_timetable')
      return stored ? JSON.parse(stored) : INITIAL_TIMETABLE_ENTRIES
    } catch {
      return INITIAL_TIMETABLE_ENTRIES
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

  // Persist role requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('locus_admin_role_requests', JSON.stringify(roleRequests))
    } catch {
      // ignore
    }
  }, [roleRequests])

  // Persist timetable to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('locus_admin_timetable', JSON.stringify(timetable))
    } catch {
      // ignore
    }
  }, [timetable])

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
  const handleApproveBooking = async (bookingId) => {
    try {
      await bookingsApi.updateBookingStatus(bookingId, 'Confirmed', currentUser)
    } catch (err) {
      console.warn('Database approve sync error:', err)
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId || b.ref === bookingId) {
          addLog(`Approved campus reservation ${b.id || b.ref} for venue ${b.venueName}`, 'Bookings', 'success')
          showNotification(`Reservation ${b.id || b.ref} confirmed successfully!`)
          return { ...b, status: 'Confirmed' }
        }
        return b
      })
    )
  }

  const handleRejectBooking = async (bookingId) => {
    try {
      await bookingsApi.updateBookingStatus(bookingId, 'Rejected', currentUser)
    } catch (err) {
      console.warn('Database reject sync error:', err)
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId || b.ref === bookingId) {
          addLog(`Rejected campus reservation ${b.id || b.ref} for venue ${b.venueName}`, 'Bookings', 'warning')
          showNotification(`Reservation ${b.id || b.ref} rejected.`)
          return { ...b, status: 'Rejected' }
        }
        return b
      })
    )
  }

  // Handlers for Venues (Integrated with Supabase persistence)
  const handleAddVenue = async (venueData) => {
    const newId = `VN-${Date.now().toString().slice(-4)}`
    const newVenue = { ...venueData, id: newId }
    setVenuesList((prev) => [newVenue, ...prev])
    addLog(`Added campus venue "${newVenue.name}" (${newVenue.code || newId})`, 'Venues', 'success')
    showNotification(`Venue "${newVenue.name}" added successfully.`)

    if (supabase && isSupabaseConfigured) {
      try {
        const venuePayload = {
          code: newVenue.code || newId,
          new_hall_name: newVenue.name,
          old_hall_name: newVenue.code || newVenue.name,
          department: newVenue.department,
          building: newVenue.building || 'Campus Complex',
          type: newVenue.type || 'Auditorium',
          benches: Number(newVenue.benches) || Math.round((Number(newVenue.capacity) || 60) / 2),
          is_active: newVenue.isActive !== false,
          status: newVenue.status || 'Available',
          description: newVenue.description || '',
          features: newVenue.features || [],
          image: newVenue.image || '/coep_building.png'
        }

        // Try inserting with capacity if non-generated, or omit if generated
        let { error } = await supabase.from('venues').insert([{ ...venuePayload, id: newId, capacity: Number(newVenue.capacity) || 60 }])
        if (error && error.message?.includes('generated column')) {
          await supabase.from('venues').insert([{ ...venuePayload, id: newId }])
        }
      } catch (err) {
        console.warn('[AdminPanel] Supabase insert venue error:', err)
      }
    }
  }

  const handleUpdateVenue = async (venueData) => {
    setVenuesList((prev) =>
      prev.map((v) => (v.id === venueData.id ? { ...v, ...venueData } : v))
    )
    addLog(`Updated venue attributes for "${venueData.name}"`, 'Venues', 'info')
    showNotification(`Updated venue "${venueData.name}".`)

    if (supabase && isSupabaseConfigured) {
      try {
        const updatePayload = {
          code: venueData.code,
          new_hall_name: venueData.name,
          department: venueData.department,
          building: venueData.building,
          type: venueData.type,
          benches: Number(venueData.benches) || Math.round((Number(venueData.capacity) || 60) / 2),
          is_active: venueData.isActive !== false,
          status: venueData.status,
          description: venueData.description,
          features: venueData.features
        }

        let { error } = await supabase.from('venues').update({
          ...updatePayload,
          capacity: Number(venueData.capacity)
        }).eq('id', venueData.id)

        if (error && error.message?.includes('generated column')) {
          await supabase.from('venues').update(updatePayload).eq('id', venueData.id)
        }
      } catch (err) {
        console.warn('[AdminPanel] Supabase update venue error:', err)
      }
    }
  }

  const handleDeleteVenue = async (venueId) => {
    const target = venuesList.find((v) => v.id === venueId)
    setVenuesList((prev) => prev.filter((v) => v.id !== venueId))
    if (target) {
      addLog(`Removed venue "${target.name}" from catalog`, 'Venues', 'warning')
      showNotification(`Venue "${target.name}" removed.`)
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('venues').delete().eq('id', venueId)
      } catch (err) {
        console.warn('[AdminPanel] Supabase delete venue error:', err)
      }
    }
  }

  const handleToggleVenueActive = async (venueId) => {
    let nextState = true
    setVenuesList((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          const next = !v.isActive
          nextState = next
          addLog(`Venue "${v.name}" status changed to ${next ? 'Active' : 'Inactive'}`, 'Venues', 'info')
          showNotification(`Venue "${v.name}" marked ${next ? 'Active' : 'Inactive'}.`)
          return { ...v, isActive: next }
        }
        return v
      })
    )

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('venues').update({ is_active: nextState }).eq('id', venueId)
      } catch (err) {
        console.warn('[AdminPanel] Supabase toggle active error:', err)
      }
    }
  }

  const handleToggleVenueMaintenance = async (venueId) => {
    let nextStatus = 'Available'
    setVenuesList((prev) =>
      prev.map((v) => {
        if (v.id === venueId) {
          nextStatus = v.status === 'Under Maintenance' ? 'Available' : 'Under Maintenance'
          addLog(`Venue "${v.name}" availability changed to ${nextStatus}`, 'Venues', nextStatus === 'Under Maintenance' ? 'warning' : 'success')
          showNotification(`Venue "${v.name}" is now ${nextStatus}.`)
          return { ...v, status: nextStatus }
        }
        return v
      })
    )

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('venues').update({ status: nextStatus }).eq('id', venueId)
      } catch (err) {
        console.warn('[AdminPanel] Supabase toggle maintenance error:', err)
      }
    }
  }

  // Handlers for Role Change Requests
  const handleApproveRoleRequest = (requestId, notes) => {
    const req = roleRequests.find((r) => r.id === requestId)
    if (!req) return

    setRoleRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Approved',
              reviewedAt: new Date().toISOString().slice(0, 10),
              approvalNotes: notes || ''
            }
          : r
      )
    )

    // Update user's role in users store
    setUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === req.userEmail.toLowerCase()) {
          return { ...u, role: req.requestedRole }
        }
        return u
      })
    )

    addLog(
      `Approved role elevation for ${req.userName} (${req.userEmail}) from ${req.currentRole} to ${req.requestedRole}`,
      'Role Elevation',
      'success'
    )
    showNotification(`Role request for ${req.userName} approved!`)
  }

  const handleRejectRoleRequest = (requestId, rejectionReason) => {
    const req = roleRequests.find((r) => r.id === requestId)
    if (!req) return

    setRoleRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Rejected',
              reviewedAt: new Date().toISOString().slice(0, 10),
              rejectionReason: rejectionReason || 'Criteria not met.'
            }
          : r
      )
    )

    addLog(
      `Rejected role request for ${req.userName} (${req.userEmail}) to ${req.requestedRole}: ${rejectionReason}`,
      'Role Elevation',
      'warning'
    )
    showNotification(`Role request for ${req.userName} rejected.`)
  }

  // Handlers for Timetable & Blocking
  const handleAddTimetableEntry = (newBlock) => {
    setTimetable((prev) => [newBlock, ...prev])
    addLog(`Created timetable block "${newBlock.title}" in ${newBlock.venueName}`, 'Timetable', 'info')
    showNotification(`Time slot blocked in ${newBlock.venueName}.`)
  }

  const handleDeleteTimetableEntry = (entryId) => {
    const target = timetable.find((t) => t.id === entryId)
    setTimetable((prev) => prev.filter((t) => t.id !== entryId))
    if (target) {
      addLog(`Removed timetable block "${target.title}" in ${target.venueName}`, 'Timetable', 'info')
      showNotification('Timetable block removed.')
    }
  }

  const handleImportTimetable = (newEntries) => {
    setTimetable((prev) => [...newEntries, ...prev])
    addLog(`Imported ${newEntries.length} academic timetable blocks`, 'Timetable Import', 'success')
    showNotification(`Imported ${newEntries.length} timetable records successfully!`)
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
    const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length
    const pendingRoleRequestsCount = roleRequests.filter((r) => r.status === 'Pending').length
    return {
      totalUsers: users.length,
      admins: users.filter((u) => u.role === 'Administrator').length,
      faculty: users.filter((u) => u.role === 'Faculty').length,
      clubLeads: users.filter((u) => u.role === 'Club Lead').length,
      students: users.filter((u) => u.role === 'Student').length,
      securityGuards: users.filter((u) => u.role === 'Security Guard').length,
      pendingBookings: pendingBookingsCount,
      pendingRoleRequests: pendingRoleRequestsCount,
      totalPendingApprovals: pendingBookingsCount + pendingRoleRequestsCount,
      confirmedBookings: bookings.filter((b) => b.status === 'Confirmed').length,
      totalVenues: venuesList.length,
      activeVenues: venuesList.filter((v) => v.isActive).length,
      availableVenues: venuesList.filter((v) => v.status === 'Available').length,
      scheduledBlocks: timetable.length
    }
  }, [users, bookings, venuesList, roleRequests, timetable])

  return (
    <ProtectedGate
      allowedRoles={['Administrator']}
      portalName="COEP Central Estate & Admin Console"
      portalDescription="Restricted to verified Central Estate administrators for campus-wide user provisioning, venue moderation, and security audit logs."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Sleek Admin Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Campus Administration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identity provisioning, space allocation reviews, and security audit records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackHome && (
              <button
                type="button"
                onClick={onBackHome}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer bg-white dark:bg-slate-850 shadow-2xs"
                title="Return to campus home"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Back to Campus</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportUsersCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer bg-white dark:bg-slate-850 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Clean Segmented Pill Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3.5">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 gap-1 overflow-x-auto max-w-full scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveSubTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'users'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directory</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">{stats.totalUsers}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('bookings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'bookings'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Approvals</span>
              {stats.totalPendingApprovals > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">{stats.totalPendingApprovals}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('venues')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'venues'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Venues</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">{stats.totalVenues}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('timetable')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'timetable'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Timetable</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">{stats.scheduledBlocks}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'logs'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        {/* Compact Modern Stat Tiles */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalUsers}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Reviews</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.pendingBookings}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Bookings</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.confirmedBookings}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Venues Listed</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.availableVenues} <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ {stats.totalVenues}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            TAB 1: USERS & ROLES
            ===================================================================== */}
        {activeSubTab === 'users' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
            {/* Unified Search & Filter Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or department..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Filter:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
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
                <thead className="bg-slate-100/75 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
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
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500 dark:text-slate-400">
                        No users matching "{userSearch}" found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{user.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {user.email}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                            className={`px-2 py-1 rounded-md text-xs font-bold border cursor-pointer outline-none transition-colors ${
                              user.role === 'Administrator'
                                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                : user.role === 'Faculty'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : user.role === 'Club Lead'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : user.role === 'Security Guard'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <option value="Administrator">Administrator</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Club Lead">Club Lead</option>
                            <option value="Student">Student</option>
                            <option value="Security Guard">Security Guard</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {user.department}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          <span className="inline-flex items-center gap-1">
                            <Key className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            {user.authProvider}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              user.status === 'Active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800'
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
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title={user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            >
                              {user.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
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
          <div className="space-y-4">
            {/* Approvals Category Switcher */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setApprovalsView('bookings')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    approvalsView === 'bookings'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Venue Reservations</span>
                  {stats.pendingBookings > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                      {stats.pendingBookings}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalsView('role_requests')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                    approvalsView === 'role_requests'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Role Change Requests</span>
                  {stats.pendingRoleRequests > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                      {stats.pendingRoleRequests}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {approvalsView === 'role_requests' ? (
              <RoleRequests
                roleRequests={roleRequests}
                onApproveRequest={handleApproveRoleRequest}
                onRejectRequest={handleRejectRoleRequest}
              />
            ) : (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search bookings or venues..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</span>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All ({bookings.length})</option>
                  <option value="Pending">Pending ({stats.pendingBookings})</option>
                  <option value="Confirmed">Confirmed ({stats.confirmedBookings})</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No reservations matching current filters.
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const isExpanded = expandedBookingIds.has(b.id)
                  return (
                    <div key={b.id} className="transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      {/* Clean Summary Row */}
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.purpose}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : b.status === 'Pending'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>{b.venueName}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{b.bookingDate}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{b.timeSlot}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions & Expand Details Button */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {b.status === 'Pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveBooking(b.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectBooking(b.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-bold text-xs transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : b.status === 'Confirmed' ? (
                            <button
                              type="button"
                              onClick={() => handleRejectBooking(b.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApproveBooking(b.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Re-approve
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleExpandBooking(b.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Less' : 'Details'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Space & Capacity
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{b.venueName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-300">
                                Expected: <strong className="text-slate-700 dark:text-slate-200">{b.attendees} attendees</strong>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Scheduled Timing
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{b.bookingDate}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-300">{b.timeSlot}</div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Organizer Identity
                              </div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">{b.applicantName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-300 font-mono text-[11px]">
                                {b.applicantEmail}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-300">
                                {b.department} • <span className="font-semibold text-slate-700 dark:text-slate-200">{b.applicantRole}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                            <span>
                              Booking Ref: <strong className="font-mono text-slate-600 dark:text-slate-300">{b.id}</strong>
                            </span>
                            <span>Submitted: {b.submittedAt}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </section>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: VENUES INVENTORY (ENHANCED TABLE & ACTIONS)
            ===================================================================== */}
        {activeSubTab === 'venues' && (
          <AdminVenues
            venues={venuesList}
            bookings={bookings}
            onAddVenue={handleAddVenue}
            onUpdateVenue={handleUpdateVenue}
            onDeleteVenue={handleDeleteVenue}
            onToggleActive={handleToggleVenueActive}
            onToggleMaintenance={handleToggleVenueMaintenance}
            onBlockVenue={() => setActiveSubTab('timetable')}
          />
        )}

        {/* =====================================================================
            TAB 4: TIMETABLE & PHYSICAL SPACE BLOCKING
            ===================================================================== */}
        {activeSubTab === 'timetable' && (
          <AdminTimetable
            timetable={timetable}
            bookings={bookings}
            venues={venuesList}
            onAddTimetableEntry={handleAddTimetableEntry}
            onDeleteTimetableEntry={handleDeleteTimetableEntry}
            onImportTimetable={handleImportTimetable}
          />
        )}

        {/* =====================================================================
            TAB 4: SECURITY AUDIT LOGS
            ===================================================================== */}
        {activeSubTab === 'logs' && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Access Logs</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Authentication audit records.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLogs([])
                  showNotification('Audit log records cleared.')
                }}
                className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              >
                Clear Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">IP / Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400 font-sans">
                        Audit trail is empty.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{log.actor}</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-sans font-medium">
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
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">{log.module}</td>
                        <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-[10px]">{log.ip}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Provision Campus User</h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Prof. Rajesh Sharma"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="name@coeptech.ac.in"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Club Lead">Club Lead</option>
                    <option value="Student">Student</option>
                    <option value="Security Guard">Security Guard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    placeholder="Computer Engineering"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
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
