import { supabase } from '../config/supabase.js'
import {
  INITIAL_ADMIN_USERS,
  INITIAL_ADMIN_VENUES,
  INITIAL_ROLE_REQUESTS,
  INITIAL_TIMETABLE_ENTRIES
} from '../../../src/components/admin/mockAdminData.js'

export const INITIAL_BOOKINGS = [
  {
    id: 'BK-2026-001',
    ref: 'STU-BK-901',
    venueId: 'VN-1',
    venueName: 'North Drawing Hall (ND01)',
    applicantName: 'Aman Nirmal',
    applicantEmail: 'student@coeptech.ac.in',
    applicantRole: 'Student',
    department: 'Computer Engineering',
    purpose: 'National Web3 & AI Hackathon Workshop',
    date: '2026-10-24',
    timeSlot: '09:00 AM - 01:00 PM',
    attendees: 120,
    status: 'Pending',
    priority: 'High',
    submittedAt: '2026-10-20 14:32',
    notes: 'Requires projector and 4 wireless collar mics.'
  },
  {
    id: 'BK-2026-002',
    ref: 'FAC-BK-101',
    venueId: 'VN-4',
    venueName: 'Auditorium Main Hall',
    applicantName: 'Dr. V. K. Kulkarni',
    applicantEmail: 'faculty@coeptech.ac.in',
    applicantRole: 'Faculty',
    department: 'Computer Engineering',
    purpose: 'End-Semester Department Research & Capstone Viva',
    date: '2026-10-28',
    timeSlot: '09:00 AM - 05:00 PM',
    attendees: 300,
    status: 'Confirmed',
    priority: 'Normal',
    submittedAt: '2026-10-18 10:15',
    notes: 'Sanctioned by Central Academic Cell.'
  },
  {
    id: 'BK-2026-003',
    ref: 'CLB-BK-401',
    venueId: 'VN-6',
    venueName: 'BHAU Main Auditorium',
    applicantName: 'MindSpark Secretarial Lead',
    applicantEmail: 'mindspark@coeptech.ac.in',
    applicantRole: 'Club Lead',
    department: 'Technical Events Secretariat',
    purpose: 'MindSpark 2026: National Tech Symposium Keynote',
    date: '2026-10-28',
    timeSlot: '08:00 AM - 06:00 PM',
    attendees: 280,
    status: 'Confirmed',
    priority: 'High',
    submittedAt: '2026-10-15 16:40',
    notes: 'VIP guest from ISRO arriving at 10 AM.'
  },
  {
    id: 'BK-2026-004',
    ref: 'STU-BK-902',
    venueId: 'VN-2',
    venueName: 'Central Library Discussion Room B',
    applicantName: 'Aman Nirmal',
    applicantEmail: 'student@coeptech.ac.in',
    applicantRole: 'Student',
    department: 'Computer Engineering',
    purpose: 'Final Year Capstone Project Coding',
    date: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4,
    status: 'Confirmed',
    priority: 'Low',
    submittedAt: '2026-10-21 09:10',
    notes: 'Requires whiteboard markers and power strips.'
  },
  {
    id: 'BK-2026-005',
    ref: 'CLB-BK-402',
    venueId: 'VN-5',
    venueName: 'Historic Boat Club & Regatta Grounds',
    applicantName: 'ZEST Sports Secretary',
    applicantEmail: 'zest@coeptech.ac.in',
    applicantRole: 'Club Lead',
    department: 'Gymkhana Sports Board',
    purpose: 'ZEST Annual Inter-Engineering Sports Carnival Inauguration',
    date: '2026-11-05',
    timeSlot: '07:00 AM - 01:00 PM',
    attendees: 500,
    status: 'Pending',
    priority: 'High',
    submittedAt: '2026-10-22 11:00',
    notes: 'Sound equipment setup required from 6:00 AM.'
  }
]

export const INITIAL_LOGS = [
  {
    id: 'LOG-001',
    timestamp: '2026-10-23 15:42',
    actor: 'admin@coeptech.ac.in',
    action: 'Approved reservation for ND01 (Aman Nirmal)',
    module: 'Bookings',
    severity: 'success',
    ip: '10.1.24.88'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-10-23 14:10',
    actor: 'faculty@coeptech.ac.in',
    action: 'Sanctioned booking for Capstone Viva (Auditorium)',
    module: 'Sanctions',
    severity: 'info',
    ip: '10.1.20.12'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-10-22 09:30',
    actor: 'security@coeptech.ac.in',
    action: 'Admitted Aman Nirmal at Gate 1 via Digital QR Pass',
    module: 'Security Gate',
    severity: 'success',
    ip: '10.1.99.04'
  }
]

export const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: "MindSpark '26: 24-Hour Campus Hackathon",
    organizer: 'MindSpark Secretary',
    club_name: 'MindSpark',
    department: 'Student Gymkhana',
    category: 'Competition',
    venue_name: 'ND01 (North Drawing Hall)',
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
    department: 'Gymkhana Robotics Cell',
    category: 'Technical Workshop',
    venue_name: 'Mechanical Seminar Hall',
    event_date: '2026-10-27',
    time_slot: '02:00 PM - 06:00 PM',
    expected_attendees: 80,
    description: 'Hands-on hardware session covering PX4 flight controllers, ROS2 nodes, and optical tracking.',
    status: 'Confirmed'
  },
  {
    id: 'evt-3',
    title: 'COEP Annual Alumni Founder Fireside Chat',
    organizer: 'BHAU Incubation Cell',
    club_name: 'BHAU Entrepreneurship',
    department: 'Central Estate & Innovation',
    category: 'Keynote & Networking',
    venue_name: 'Main Auditorium',
    event_date: '2026-11-02',
    time_slot: '10:00 AM - 01:00 PM',
    expected_attendees: 400,
    description: 'COEP alumni unicorn founders share insights on engineering leadership and startup venture funding.',
    status: 'Confirmed'
  }
]

// DataStore with Supabase integration and offline fallback
class DataStore {
  constructor() {
    this.users = [...INITIAL_ADMIN_USERS]
    this.venues = [...INITIAL_ADMIN_VENUES]
    this.bookings = [...INITIAL_BOOKINGS]
    this.roleRequests = [...INITIAL_ROLE_REQUESTS]
    this.timetable = [...INITIAL_TIMETABLE_ENTRIES]
    this.logs = [...INITIAL_LOGS]
    this.events = [...INITIAL_EVENTS]
  }

  // --- VENUES ---
  async getVenues(filter = {}) {
    if (supabase) {
      try {
        let query = supabase.from('venues').select('*')
        if (filter.department && filter.department !== 'All') {
          query = query.ilike('department', `%${filter.department}%`)
        }
        if (filter.status && filter.status !== 'All') {
          query = query.eq('status', filter.status)
        }
        const { data, error } = await query
        if (!error && data && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('[Supabase] venues query failed, falling back to local store:', err.message)
      }
    }

    let result = [...this.venues]
    if (filter.department && filter.department !== 'All') {
      result = result.filter((v) => v.department.toLowerCase() === filter.department.toLowerCase())
    }
    if (filter.status && filter.status !== 'All') {
      result = result.filter((v) => v.status.toLowerCase() === filter.status.toLowerCase())
    }
    if (filter.search) {
      const q = filter.search.toLowerCase()
      result = result.filter((v) => v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q))
    }
    return result
  }

  async getVenueById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('venues').select('*').or(`id.eq.${id},code.eq.${id}`).single()
        if (!error && data) return data
      } catch {
        // ignore
      }
    }
    return this.venues.find((v) => v.id === id || v.code === id) || null
  }

  async createVenue(data) {
    const newVenue = {
      id: `VN-${Date.now()}`,
      code: data.code || `VN${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      department: data.department || 'General Campus',
      category: data.category || 'Classrooms',
      capacity: Number(data.capacity) || 60,
      status: data.status || 'Available',
      isActive: true,
      features: data.features || ['Projector', 'Air Conditioned'],
      image: data.image || '/campus.jpeg',
      description: data.description || 'Institutional academic venue.',
      createdAt: new Date().toISOString()
    }

    if (supabase) {
      try {
        await supabase.from('venues').insert([newVenue])
      } catch (err) {
        console.warn('[Supabase] venue insertion error:', err.message)
      }
    }

    this.venues.unshift(newVenue)
    this.addLog(`Created venue ${newVenue.name} (${newVenue.code})`, 'Venues', 'success')
    return newVenue
  }

  async updateVenue(id, updates) {
    if (supabase) {
      try {
        await supabase.from('venues').update(updates).or(`id.eq.${id},code.eq.${id}`)
      } catch (err) {
        console.warn('[Supabase] venue update error:', err.message)
      }
    }

    const idx = this.venues.findIndex((v) => v.id === id || v.code === id)
    if (idx === -1) return null
    this.venues[idx] = { ...this.venues[idx], ...updates }
    this.addLog(`Updated venue ${this.venues[idx].name}`, 'Venues', 'info')
    return this.venues[idx]
  }

  async deleteVenue(id) {
    if (supabase) {
      try {
        await supabase.from('venues').delete().or(`id.eq.${id},code.eq.${id}`)
      } catch (err) {
        console.warn('[Supabase] venue delete error:', err.message)
      }
    }

    const idx = this.venues.findIndex((v) => v.id === id || v.code === id)
    if (idx === -1) return false
    const removed = this.venues.splice(idx, 1)[0]
    this.addLog(`Deleted venue ${removed.name}`, 'Venues', 'warning')
    return true
  }

  // --- BOOKINGS & CONFLICT RESOLUTION ---
  async getBookings(filter = {}) {
    if (supabase) {
      try {
        let query = supabase.from('bookings').select('*').order('date', { ascending: false })
        if (filter.status && filter.status !== 'All') {
          query = query.eq('status', filter.status)
        }
        if (filter.userEmail) {
          query = query.eq('applicantEmail', filter.userEmail.toLowerCase().trim())
        }
        const { data, error } = await query
        if (!error && data && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('[Supabase] bookings query failed, falling back to local store:', err.message)
      }
    }

    let result = [...this.bookings]
    if (filter.status && filter.status !== 'All') {
      result = result.filter((b) => b.status.toLowerCase() === filter.status.toLowerCase())
    }
    if (filter.userEmail) {
      const email = filter.userEmail.toLowerCase().trim()
      result = result.filter((b) => b.applicantEmail && b.applicantEmail.toLowerCase().trim() === email)
    }
    if (filter.venueName) {
      result = result.filter((b) => b.venueName.toLowerCase().includes(filter.venueName.toLowerCase()))
    }
    if (filter.date) {
      result = result.filter((b) => b.date === filter.date)
    }
    if (filter.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (b) =>
          b.purpose?.toLowerCase().includes(q) ||
          b.applicantName?.toLowerCase().includes(q) ||
          b.venueName?.toLowerCase().includes(q)
      )
    }
    return result
  }

  async getBookingById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').or(`id.eq.${id},ref.eq.${id}`).single()
        if (!error && data) return data
      } catch {
        // ignore
      }
    }
    return this.bookings.find((b) => b.id === id || b.ref === id) || null
  }

  checkBookingConflict(venueName, date, timeSlot, excludeId = null) {
    const activeBookings = this.bookings.filter((b) => {
      if (excludeId && (b.id === excludeId || b.ref === excludeId)) return false
      if (b.status === 'Cancelled' || b.status === 'Rejected') return false
      return (
        (b.venueName === venueName || b.venue === venueName) &&
        b.date === date
      )
    })

    for (const b of activeBookings) {
      if (b.timeSlot === timeSlot) {
        return { hasConflict: true, conflictingBooking: b }
      }
    }
    return { hasConflict: false }
  }

  async createBooking(data) {
    const venueName = data.venueName || data.venue
    const conflict = this.checkBookingConflict(venueName, data.date, data.timeSlot)
    if (conflict.hasConflict) {
      const err = new Error(
        `Time slot conflict: ${venueName} is already reserved on ${data.date} for "${conflict.conflictingBooking.purpose}" (${conflict.conflictingBooking.status}).`
      )
      err.status = 409
      throw err
    }

    const newBooking = {
      id: `BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      ref: data.ref || `STU-BK-${Math.floor(100 + Math.random() * 900)}`,
      venueId: data.venueId || 'VN-GEN',
      venueName: venueName,
      venue: venueName,
      applicantName: data.applicantName || 'Campus Member',
      applicantEmail: data.applicantEmail || 'student@coeptech.ac.in',
      applicantRole: data.applicantRole || 'Student',
      department: data.department || 'Computer Engineering',
      purpose: data.purpose || data.title || 'Academic Activity',
      date: data.date,
      timeSlot: data.timeSlot,
      attendees: Number(data.attendees) || 50,
      status: data.status || 'Pending',
      priority: data.priority || 'Normal',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: data.notes || data.requirements || ''
    }

    if (supabase) {
      try {
        await supabase.from('bookings').insert([newBooking])
      } catch (err) {
        console.warn('[Supabase] booking insertion error:', err.message)
      }
    }

    this.bookings.unshift(newBooking)
    this.addLog(
      `Reservation submitted for ${newBooking.venueName} by ${newBooking.applicantName} (${newBooking.date})`,
      'Bookings',
      'info'
    )
    return newBooking
  }

  async updateBookingStatus(id, newStatus, reason = '', actor = 'Administrator') {
    const updates = {
      status: newStatus,
      decisionNotes: reason,
      decidedBy: actor,
      decidedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }

    if (supabase) {
      try {
        await supabase.from('bookings').update(updates).or(`id.eq.${id},ref.eq.${id}`)
      } catch (err) {
        console.warn('[Supabase] booking status update error:', err.message)
      }
    }

    const idx = this.bookings.findIndex((b) => b.id === id || b.ref === id)
    if (idx === -1) return null

    this.bookings[idx] = {
      ...this.bookings[idx],
      ...updates
    }

    this.addLog(
      `Booking ${id} status updated to ${newStatus} by ${actor}`,
      'Sanctions',
      newStatus === 'Confirmed' || newStatus === 'Approved' ? 'success' : 'warning'
    )
    return this.bookings[idx]
  }

  async deleteBooking(id) {
    if (supabase) {
      try {
        await supabase.from('bookings').delete().or(`id.eq.${id},ref.eq.${id}`)
      } catch (err) {
        console.warn('[Supabase] booking delete error:', err.message)
      }
    }

    const idx = this.bookings.findIndex((b) => b.id === id || b.ref === id)
    if (idx === -1) return false
    const removed = this.bookings.splice(idx, 1)[0]
    this.addLog(`Booking ${id} (${removed.venueName}) deleted`, 'Bookings', 'warning')
    return true
  }

  // --- PASS VERIFICATION (FOR SECURITY PORTAL) ---
  verifyPass(passCode) {
    const code = (passCode || '').trim().toUpperCase()
    const booking = this.bookings.find(
      (b) =>
        (b.ref && b.ref.toUpperCase() === code) ||
        (b.id && b.id.toUpperCase() === code) ||
        code.includes(b.ref || '') ||
        code.includes(b.id || '')
    )

    if (booking) {
      return {
        isValid: booking.status === 'Confirmed' || booking.status === 'Approved',
        passId: `COEP-PASS-${booking.id}`,
        bookingId: booking.ref || booking.id,
        holderName: booking.applicantName,
        role: booking.applicantRole,
        department: booking.department,
        venue: booking.venueName || booking.venue,
        purpose: booking.purpose,
        date: booking.date,
        timeSlot: booking.timeSlot,
        attendees: booking.attendees,
        status: booking.status === 'Confirmed' || booking.status === 'Approved' ? 'Valid' : booking.status
      }
    }

    return null
  }

  // --- USERS & DIRECTORY ---
  async getUsers(filter = {}) {
    if (supabase) {
      try {
        let query = supabase.from('users').select('*')
        if (filter.role && filter.role !== 'All') {
          query = query.eq('role', filter.role)
        }
        const { data, error } = await query
        if (!error && data && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('[Supabase] users query failed, falling back to local store:', err.message)
      }
    }

    let result = [...this.users]
    if (filter.role && filter.role !== 'All') {
      result = result.filter((u) => u.role.toLowerCase() === filter.role.toLowerCase())
    }
    if (filter.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      )
    }
    return result
  }

  async createUser(data) {
    const newUser = {
      id: `USR-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      role: data.role || 'Student',
      department: data.department || 'General Academic',
      status: data.status || 'Active',
      lastActive: 'Just registered',
      createdAt: new Date().toISOString().slice(0, 10)
    }

    if (supabase) {
      try {
        await supabase.from('users').insert([newUser])
      } catch (err) {
        console.warn('[Supabase] user creation error:', err.message)
      }
    }

    this.users.unshift(newUser)
    this.addLog(`Provisioned campus user ${newUser.name} (${newUser.role})`, 'Directory', 'success')
    return newUser
  }

  async bulkCreateUsers(usersArray) {
    const timestamp = Date.now()
    const created = usersArray.map((u, i) => ({
      id: `USR-${timestamp}-${i}`,
      name: u.name,
      email: u.email.toLowerCase().trim(),
      role: u.role || 'Student',
      department: u.department || 'General Academic',
      status: 'Active',
      lastActive: 'Just imported',
      createdAt: new Date().toISOString().slice(0, 10)
    }))

    if (supabase) {
      try {
        await supabase.from('users').insert(created)
      } catch (err) {
        console.warn('[Supabase] bulk user creation error:', err.message)
      }
    }

    this.users = [...created, ...this.users]
    this.addLog(`Bulk imported ${created.length} users into directory`, 'Directory', 'success')
    return created
  }

  async updateUserRole(id, newRole) {
    if (supabase) {
      try {
        await supabase.from('users').update({ role: newRole }).eq('id', id)
      } catch (err) {
        console.warn('[Supabase] update user role error:', err.message)
      }
    }

    const idx = this.users.findIndex((u) => u.id === id)
    if (idx === -1) return null
    this.users[idx].role = newRole
    this.addLog(`Updated role of user ${this.users[idx].email} to ${newRole}`, 'Access Control', 'info')
    return this.users[idx]
  }

  async updateUserStatus(id, newStatus) {
    if (supabase) {
      try {
        await supabase.from('users').update({ status: newStatus }).eq('id', id)
      } catch (err) {
        console.warn('[Supabase] update user status error:', err.message)
      }
    }

    const idx = this.users.findIndex((u) => u.id === id)
    if (idx === -1) return null
    this.users[idx].status = newStatus
    this.addLog(`User ${this.users[idx].email} status set to ${newStatus}`, 'User Security', 'warning')
    return this.users[idx]
  }

  async deleteUser(id) {
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('id', id)
      } catch (err) {
        console.warn('[Supabase] delete user error:', err.message)
      }
    }

    const idx = this.users.findIndex((u) => u.id === id)
    if (idx === -1) return false
    const removed = this.users.splice(idx, 1)[0]
    this.addLog(`Removed user ${removed.name} (${removed.email})`, 'Directory', 'warning')
    return true
  }

  // --- ROLE REQUESTS ---
  async getRoleRequests() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('role_requests').select('*').order('submittedAt', { ascending: false })
        if (!error && data && data.length > 0) return data
      } catch {
        // fallback
      }
    }
    return [...this.roleRequests]
  }

  async createRoleRequest(data) {
    const newReq = {
      id: `REQ-${Date.now()}`,
      applicantName: data.applicantName,
      applicantEmail: data.applicantEmail,
      currentRole: data.currentRole || 'Student',
      requestedRole: data.requestedRole,
      department: data.department || 'Computer Engineering',
      justification: data.justification || 'Official departmental requirements.',
      status: 'Pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }

    if (supabase) {
      try {
        await supabase.from('role_requests').insert([newReq])
      } catch (err) {
        console.warn('[Supabase] role request insert error:', err.message)
      }
    }

    this.roleRequests.unshift(newReq)
    this.addLog(`Role upgrade requested by ${newReq.applicantName} for ${newReq.requestedRole}`, 'Role Requests', 'info')
    return newReq
  }

  async updateRoleRequest(id, status, reviewedBy = 'Administrator') {
    const updates = {
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }

    if (supabase) {
      try {
        await supabase.from('role_requests').update(updates).eq('id', id)
      } catch (err) {
        console.warn('[Supabase] role request update error:', err.message)
      }
    }

    const idx = this.roleRequests.findIndex((r) => r.id === id)
    if (idx === -1) return null
    this.roleRequests[idx] = { ...this.roleRequests[idx], ...updates }

    if (status === 'Approved') {
      const user = this.users.find((u) => u.email === this.roleRequests[idx].applicantEmail)
      if (user) {
        user.role = this.roleRequests[idx].requestedRole
        if (supabase) {
          supabase.from('users').update({ role: user.role }).eq('id', user.id).catch(() => {})
        }
      }
    }

    this.addLog(`Role request ${id} ${status} by ${reviewedBy}`, 'Role Requests', status === 'Approved' ? 'success' : 'warning')
    return this.roleRequests[idx]
  }

  // --- TIMETABLE ---
  async getTimetable() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('timetable').select('*')
        if (!error && data && data.length > 0) return data
      } catch {
        // fallback
      }
    }
    return [...this.timetable]
  }

  async createTimetableEntry(data) {
    const entry = {
      id: `TT-${Date.now()}`,
      venueId: data.venueId || 'VN-1',
      venueName: data.venueName,
      title: data.title,
      courseCode: data.courseCode || 'CS301',
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      facultyName: data.facultyName,
      semester: data.semester || 'B.Tech Sem VI',
      department: data.department || 'Computer Engineering'
    }

    if (supabase) {
      try {
        await supabase.from('timetable').insert([entry])
      } catch (err) {
        console.warn('[Supabase] timetable insert error:', err.message)
      }
    }

    this.timetable.unshift(entry)
    this.addLog(`Created timetable block "${entry.title}" in ${entry.venueName}`, 'Timetable', 'info')
    return entry
  }

  async bulkCreateTimetable(entries) {
    const created = entries.map((e, idx) => ({
      id: `TT-${Date.now()}-${idx}`,
      ...e
    }))

    if (supabase) {
      try {
        await supabase.from('timetable').insert(created)
      } catch (err) {
        console.warn('[Supabase] bulk timetable insert error:', err.message)
      }
    }

    this.timetable = [...created, ...this.timetable]
    this.addLog(`Imported ${created.length} academic timetable entries`, 'Timetable Import', 'success')
    return created
  }

  async deleteTimetableEntry(id) {
    if (supabase) {
      try {
        await supabase.from('timetable').delete().eq('id', id)
      } catch (err) {
        console.warn('[Supabase] timetable delete error:', err.message)
      }
    }

    const idx = this.timetable.findIndex((t) => t.id === id)
    if (idx === -1) return false
    const removed = this.timetable.splice(idx, 1)[0]
    this.addLog(`Removed timetable block "${removed.title}" in ${removed.venueName}`, 'Timetable', 'info')
    return true
  }

  // --- LOGS ---
  async getLogs(limit = 100) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(limit)
        if (!error && data && data.length > 0) return data
      } catch {
        // fallback
      }
    }
    return this.logs.slice(0, limit)
  }

  addLog(action, module = 'System', severity = 'info', actor = 'system', ip = '127.0.0.1') {
    const log = {
      id: `LOG-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actor,
      action,
      module,
      severity,
      ip
    }

    if (supabase) {
      supabase.from('audit_logs').insert([log]).catch(() => {})
    }

    this.logs.unshift(log)
    if (this.logs.length > 500) this.logs.pop()
    return log
  }

  // --- EVENTS ---
  async getEvents() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true })
        if (!error && data && data.length > 0) return data
      } catch {
        // fallback
      }
    }
    return [...this.events]
  }
}

export const dataStore = new DataStore()
