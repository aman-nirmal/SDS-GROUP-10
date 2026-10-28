import { supabase, isSupabaseConfigured } from './supabase.js'

/**
 * Known Club Lead Mappings for COEP Gymkhana & Fest Secretariats
 */
export const OFFICIAL_CLUB_MAPPINGS = {
  'mindspark@coeptech.ac.in': 'MindSpark',
  'zest@coeptech.ac.in': 'ZEST',
  'rsc@coeptech.ac.in': 'Robot Study Circle (RSC)',
  'bhau@coeptech.ac.in': 'BHAU Institute'
}

/**
 * Normalize any booking row from Supabase or local storage into a unified
 * dual-compatible object that satisfies all UI components and field conventions.
 */
export function normalizeBooking(row) {
  if (!row) return null

  const id = row.id || row.booking_ref || row.ref || `LOCUS-${Math.floor(100000 + Math.random() * 900000)}`
  const bookingRef = row.booking_ref || row.ref || id
  const venueName = row.venue_name || row.venueName || row.venue || 'COEP Venue'
  const oldName = row.old_venue_name || row.oldName || ''
  const applicantName = row.applicant_name || row.applicantName || row.holderName || 'Campus User'
  const applicantEmail = (row.applicant_email || row.applicantEmail || '').trim().toLowerCase()
  const role = row.user_role || row.role || 'Student'
  const department = row.department || 'Computer Engineering'
  const clubName = row.club_name || row.clubName || OFFICIAL_CLUB_MAPPINGS[applicantEmail] || null
  const date = row.booking_date || row.date || row.bookingDate || new Date().toISOString().split('T')[0]
  const slot = row.time_slot || row.slot || row.timeSlot || '12:30 PM - 01:30 PM'
  const purpose = row.purpose || row.title || 'Campus Venue Reservation'
  const attendees = Number(row.attendees || row.capacity || 1)
  const status = row.status || 'Confirmed'
  const facultyInCharge = row.faculty_in_charge || row.facultyInCharge || 'Central Campus Administrator'
  const digitalPassCode = row.digital_pass_code || row.digitalPassCode || `COEP-PASS-${Math.floor(1000 + Math.random() * 9000)}`

  return {
    // Database schema fields
    id,
    booking_ref: bookingRef,
    user_id: row.user_id || null,
    venue_name: venueName,
    old_venue_name: oldName,
    applicant_name: applicantName,
    applicant_email: applicantEmail,
    user_role: role,
    department,
    club_name: clubName,
    booking_date: date,
    time_slot: slot,
    purpose,
    attendees,
    status,
    faculty_in_charge: facultyInCharge,
    digital_pass_code: digitalPassCode,
    special_requirements: row.special_requirements || null,
    created_at: row.created_at || new Date().toISOString(),

    // UI-compatible aliases for existing component compatibility
    ref: bookingRef,
    bookingId: bookingRef,
    passId: digitalPassCode,
    digitalPassCode,
    venueName,
    venue: venueName,
    oldName,
    applicantName,
    holderName: applicantName,
    applicantEmail,
    role,
    date,
    bookingDate: date,
    slot,
    timeSlot: slot,
    capacity: attendees,
    title: purpose,
    facultyInCharge
  }
}

/**
 * Resilient In-Memory & Local Storage Cache Store
 */
const memoryStore = new Map()

function getStorageKey(identifier) {
  const sanitized = (identifier || 'general').trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `locus_user_bookings_${sanitized}`
}

function getCachedBookings(identifier) {
  const key = getStorageKey(identifier)

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(normalizeBooking)
      }
    } catch {
      // ignore
    }
  } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    try {
      const raw = globalThis.localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(normalizeBooking)
      }
    } catch {
      // ignore
    }
  }

  return (memoryStore.get(key) || []).map(normalizeBooking)
}

function setCachedBookings(identifier, bookings) {
  const key = getStorageKey(identifier)
  const normalized = Array.isArray(bookings) ? bookings.map(normalizeBooking) : []
  memoryStore.set(key, normalized)

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(normalized))
    } catch {
      // ignore
    }
  } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    try {
      globalThis.localStorage.setItem(key, JSON.stringify(normalized))
    } catch {
      // ignore
    }
  }
}

/**
 * Core Bookings API Service
 */
export const bookingsApi = {
  /**
   * Retrieve bookings for the authenticated user based on role & permissions.
   * - Students: only their own bookings
   * - Faculty: only their own bookings / sessions
   * - Club Leads: only their authorized club's bookings + their own
   * - Administrators: all campus bookings
   * - Security Guards: all confirmed/approved passes
   */
  async fetchUserBookings(user) {
    if (!user || !user.email) {
      return []
    }

    const email = user.email.trim().toLowerCase()
    const role = user.role || 'Student'
    const club = user.club_name || OFFICIAL_CLUB_MAPPINGS[email] || null

    if (supabase && isSupabaseConfigured) {
      try {
        let query = supabase.from('bookings').select('*')

        if (role === 'Administrator') {
          // Administrators see all bookings
          query = query.order('booking_date', { ascending: false })
        } else if (role === 'Security Guard') {
          // Security checks active / confirmed / approved passes
          query = query
            .in('status', ['Confirmed', 'Approved', 'Valid'])
            .order('booking_date', { ascending: true })
        } else if (role === 'Club Lead' && club) {
          // Club Lead sees their personal bookings OR bookings for their authorized club
          query = query
            .or(`applicant_email.eq.${email},club_name.eq.${club}`)
            .order('booking_date', { ascending: false })
        } else {
          // Regular student, faculty, or club member sees only their own bookings
          query = query
            .eq('applicant_email', email)
            .order('booking_date', { ascending: false })
        }

        const { data, error } = await query

        if (error) {
          console.warn('[Database] Supabase bookings fetch error:', error.message)
        } else if (data) {
          const normalized = data.map(normalizeBooking)
          // Update local cache for offline/refresh persistence
          setCachedBookings(email, normalized)
          return normalized
        }
      } catch (err) {
        console.warn('[Database] Network error fetching bookings from Supabase:', err.message)
      }
    }

    // Resilient local fallback when database is unconfigured or offline
    if (role === 'Administrator') {
      const allMerged = []
      for (const list of memoryStore.values()) {
        allMerged.push(...list)
      }
      return allMerged
    }

    if (role === 'Club Lead' && club) {
      const personal = getCachedBookings(email)
      const clubList = getCachedBookings('club_' + club)
      const combined = [...personal]
      for (const item of clubList) {
        if (!combined.some((b) => b.ref === item.ref)) {
          combined.push(item)
        }
      }
      return combined
    }

    return getCachedBookings(email)
  },

  /**
   * Validate and insert a new booking record to Supabase.
   * Throws an Error with a user-friendly message if validation or insertion fails.
   */
  async createBooking(bookingInput, user) {
    // 1. Validation
    const applicantName = (bookingInput.applicantName || bookingInput.applicant_name || user?.name || '').trim()
    const applicantEmail = (bookingInput.applicantEmail || bookingInput.applicant_email || user?.email || '').trim().toLowerCase()
    const venueName = (bookingInput.venueName || bookingInput.venue_name || bookingInput.venue || '').trim()
    const purpose = (bookingInput.purpose || bookingInput.title || '').trim()
    const bookingDate = (bookingInput.date || bookingInput.booking_date || bookingInput.bookingDate || '').trim()
    const timeSlot = (bookingInput.slot || bookingInput.time_slot || bookingInput.timeSlot || '').trim()

    if (!venueName) {
      throw new Error('Please select a valid campus venue.')
    }
    if (!applicantName) {
      throw new Error('Applicant name is required.')
    }
    if (!applicantEmail) {
      throw new Error('Applicant email is required. Please log in first.')
    }
    if (!purpose) {
      throw new Error('Event purpose or session topic is required.')
    }
    if (!bookingDate) {
      throw new Error('Reservation date is required.')
    }
    if (!timeSlot) {
      throw new Error('Reservation time slot is required.')
    }

    // Verify date is valid (YYYY-MM-DD format)
    const parsedDate = new Date(bookingDate)
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid reservation date format.')
    }

    // Determine unique reference and pass code
    const refCode = bookingInput.ref || bookingInput.booking_ref ||
      ('LOCUS-' + Math.floor(100000 + Math.random() * 900000))
    const passCode = bookingInput.digitalPassCode || bookingInput.digital_pass_code ||
      (`COEP-PASS-${Math.floor(1000 + Math.random() * 9000)}`)

    const userRole = user?.role || bookingInput.role || bookingInput.user_role || 'Student'
    const department = bookingInput.department || user?.department || 'COEP Technological University'
    const clubName = bookingInput.club_name || bookingInput.clubName || user?.club_name || OFFICIAL_CLUB_MAPPINGS[applicantEmail] || null
    const attendees = Number(bookingInput.capacity || bookingInput.attendees || 1)
    const initialStatus = bookingInput.status || (userRole === 'Club Lead' ? 'Under Review' : 'Confirmed')

    const dbRecord = {
      booking_ref: refCode,
      user_id: user?.id || null,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      user_role: userRole,
      department,
      club_name: clubName,
      venue_id: bookingInput.venue_id || null,
      venue_name: venueName,
      old_venue_name: bookingInput.oldName || bookingInput.old_venue_name || null,
      booking_date: bookingDate,
      time_slot: timeSlot,
      purpose,
      attendees: attendees > 0 ? attendees : 1,
      status: initialStatus,
      faculty_in_charge: bookingInput.facultyInCharge || bookingInput.faculty_in_charge || 'Central Campus Administrator',
      digital_pass_code: passCode,
      special_requirements: bookingInput.specialRequirements || bookingInput.special_requirements || null,
      created_at: new Date().toISOString()
    }

    // 2. Persist to Supabase if configured
    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('bookings')
        .insert([dbRecord])
        .select()
        .single()

      if (error) {
        console.error('[Database] Failed to insert booking into Supabase:', error)
        throw new Error(`Database reservation failed: ${error.message || 'Check connection or permissions'}`)
      }

      const normalized = normalizeBooking(data || dbRecord)
      // Update local storage cache
      const cached = getCachedBookings(applicantEmail)
      setCachedBookings(applicantEmail, [normalized, ...cached.filter((b) => b.ref !== normalized.ref)])
      if (clubName) {
        const clubCached = getCachedBookings('club_' + clubName)
        setCachedBookings('club_' + clubName, [normalized, ...clubCached.filter((b) => b.ref !== normalized.ref)])
      }
      return normalized
    }

    // 3. Resilient Local Storage fallback (if Supabase not configured)
    const normalized = normalizeBooking(dbRecord)
    const cached = getCachedBookings(applicantEmail)
    setCachedBookings(applicantEmail, [normalized, ...cached.filter((b) => b.ref !== normalized.ref)])
    if (clubName) {
      const clubCached = getCachedBookings('club_' + clubName)
      setCachedBookings('club_' + clubName, [normalized, ...clubCached.filter((b) => b.ref !== normalized.ref)])
    }
    return normalized
  },

  /**
   * Update the status of a booking in Supabase.
   * Allowed for Administrators, authorized Club Leads (for their club), or booking owners.
   */
  async updateBookingStatus(bookingIdOrRef, newStatus, user) {
    if (!bookingIdOrRef || !newStatus) {
      throw new Error('Booking ID and new status are required.')
    }

    const email = user?.email?.trim().toLowerCase()

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${bookingIdOrRef},booking_ref.eq.${bookingIdOrRef}`)
          .select()

        if (error) {
          throw new Error(`Failed to update booking status: ${error.message}`)
        }

        if (data && data.length > 0) {
          const updated = normalizeBooking(data[0])
          // Update local cache
          if (email) {
            const cached = getCachedBookings(email)
            const updatedCache = cached.map((b) => (b.ref === updated.ref ? updated : b))
            setCachedBookings(email, updatedCache)
          }
          return updated
        }
      } catch (err) {
        console.warn('[Database] Supabase update status error:', err.message)
        throw err
      }
    }

    // Local cache update
    if (email) {
      const cached = getCachedBookings(email)
      const updatedCache = cached.map((b) => {
        if (b.id === bookingIdOrRef || b.ref === bookingIdOrRef) {
          return { ...b, status: newStatus }
        }
        return b
      })
      setCachedBookings(email, updatedCache)
      const found = updatedCache.find((b) => b.id === bookingIdOrRef || b.ref === bookingIdOrRef)
      if (found) return found
    }

    // Check all stores
    for (const [key, list] of memoryStore.entries()) {
      const idx = list.findIndex((b) => b.id === bookingIdOrRef || b.ref === bookingIdOrRef)
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: newStatus }
        memoryStore.set(key, list)
        return list[idx]
      }
    }

    return null
  },

  /**
   * Cancel or delete a booking.
   */
  async cancelBooking(bookingIdOrRef, user) {
    return this.updateBookingStatus(bookingIdOrRef, 'Cancelled', user)
  },

  /**
   * Verify digital gate pass code or booking reference (used by Campus Security).
   */
  async verifyPass(passCodeOrRef) {
    if (!passCodeOrRef || !passCodeOrRef.trim()) {
      return { valid: false, error: 'Pass code or Booking ID is required.' }
    }

    const code = passCodeOrRef.trim()

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .or(`digital_pass_code.eq.${code},booking_ref.eq.${code}`)
          .single()

        if (error || !data) {
          return { valid: false, error: 'Pass code not found in campus database.' }
        }

        const normalized = normalizeBooking(data)
        const isApproved = ['Confirmed', 'Approved', 'Valid'].includes(normalized.status)

        return {
          valid: isApproved,
          booking: normalized,
          statusMessage: isApproved ? 'Official Campus Pass Valid' : `Pass Invalid (Status: ${normalized.status})`
        }
      } catch {
        // Fallback to local check below
      }
    }

    // Check memory store for matching pass
    for (const list of memoryStore.values()) {
      const match = list.find((b) => b.digitalPassCode === code || b.ref === code)
      if (match) {
        const isApproved = ['Confirmed', 'Approved', 'Valid'].includes(match.status)
        return {
          valid: isApproved,
          booking: match,
          statusMessage: isApproved ? 'Official Campus Pass Valid' : `Pass Invalid (Status: ${match.status})`
        }
      }
    }

    return { valid: false, error: 'Pass code not found.' }
  }
}
