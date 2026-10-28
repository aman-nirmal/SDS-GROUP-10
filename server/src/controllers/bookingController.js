import { supabase } from '../config/supabase.js'

export const bookingController = {
  /**
   * GET /api/bookings
   * Query bookings scoped to user role & email
   */
  async getBookings(req, res) {
    try {
      const userEmail = req.query.email ? req.query.email.trim().toLowerCase() : null
      const userRole = req.query.role || 'Student'
      const clubName = req.query.club || null

      if (!supabase) {
        return res.json({
          success: true,
          bookings: [],
          source: 'local-fallback'
        })
      }

      let query = supabase.from('bookings').select('*')

      if (userRole === 'Administrator') {
        query = query.order('booking_date', { ascending: false })
      } else if (userRole === 'Security Guard') {
        query = query.in('status', ['Confirmed', 'Approved', 'Valid']).order('booking_date', { ascending: true })
      } else if (userRole === 'Club Lead' && clubName) {
        query = query.or(`applicant_email.eq.${userEmail},club_name.eq.${clubName}`).order('booking_date', { ascending: false })
      } else if (userEmail) {
        query = query.eq('applicant_email', userEmail).order('booking_date', { ascending: false })
      } else {
        return res.status(400).json({ error: 'User email or role filter is required.' })
      }

      const { data, error } = await query

      if (error) {
        return res.status(500).json({ error: 'Failed to retrieve bookings from database.', details: error.message })
      }

      return res.json({
        success: true,
        bookings: data || [],
        count: data ? data.length : 0
      })
    } catch (err) {
      return res.status(500).json({ error: 'Server error retrieving bookings.', details: err.message })
    }
  },

  /**
   * POST /api/bookings
   * Validate and insert booking
   */
  async createBooking(req, res) {
    try {
      const {
        venueName,
        applicantName,
        applicantEmail,
        bookingDate,
        timeSlot,
        purpose,
        department,
        clubName,
        capacity,
        facultyInCharge,
        userRole
      } = req.body

      // Validation
      if (!venueName || !applicantName || !applicantEmail || !bookingDate || !timeSlot || !purpose) {
        return res.status(400).json({
          error: 'Missing required booking fields: venueName, applicantName, applicantEmail, bookingDate, timeSlot, and purpose are required.'
        })
      }

      const refCode = 'LOCUS-' + Math.floor(100000 + Math.random() * 900000)
      const passCode = `COEP-PASS-${Math.floor(1000 + Math.random() * 9000)}`

      const record = {
        booking_ref: refCode,
        applicant_name: applicantName.trim(),
        applicant_email: applicantEmail.trim().toLowerCase(),
        user_role: userRole || 'Student',
        department: department || 'COEP Technological University',
        club_name: clubName || null,
        venue_name: venueName.trim(),
        booking_date: bookingDate,
        time_slot: timeSlot,
        purpose: purpose.trim(),
        attendees: Number(capacity) || 1,
        status: userRole === 'Club Lead' ? 'Under Review' : 'Confirmed',
        faculty_in_charge: facultyInCharge || 'Central Campus Administrator',
        digital_pass_code: passCode,
        created_at: new Date().toISOString()
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('bookings')
          .insert([record])
          .select()
          .single()

        if (error) {
          return res.status(500).json({ error: 'Database insert failed.', details: error.message })
        }

        return res.status(201).json({
          success: true,
          booking: data,
          message: 'Campus venue reserved successfully.'
        })
      }

      return res.status(201).json({
        success: true,
        booking: record,
        message: 'Campus venue reserved in local mode.'
      })
    } catch (err) {
      return res.status(500).json({ error: 'Server error creating booking.', details: err.message })
    }
  },

  /**
   * PATCH /api/bookings/:id/status
   * Update status with role authorization check
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params
      const { status, userRole } = req.body

      if (!status) {
        return res.status(400).json({ error: 'New status is required.' })
      }

      // Authorization check
      if (userRole && !['Administrator', 'Club Lead', 'Faculty'].includes(userRole) && status !== 'Cancelled') {
        return res.status(403).json({ error: 'Unauthorized: Only administrators and designated leads can modify booking status.' })
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('bookings')
          .update({ status, updated_at: new Date().toISOString() })
          .or(`id.eq.${id},booking_ref.eq.${id}`)
          .select()

        if (error) {
          return res.status(500).json({ error: 'Failed to update booking status in database.', details: error.message })
        }

        return res.json({
          success: true,
          booking: data && data[0],
          message: `Booking status updated to ${status}.`
        })
      }

      return res.json({
        success: true,
        message: `Booking status updated to ${status} in local mode.`
      })
    } catch (err) {
      return res.status(500).json({ error: 'Server error updating booking status.', details: err.message })
    }
  },

  /**
   * GET /api/bookings/verify-pass/:code
   * Security pass code lookup
   */
  async verifyPass(req, res) {
    try {
      const { code } = req.params
      if (!code) {
        return res.status(400).json({ error: 'Pass code or Booking reference is required.' })
      }

      if (supabase) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .or(`digital_pass_code.eq.${code},booking_ref.eq.${code}`)
          .single()

        if (error || !data) {
          return res.status(404).json({ valid: false, error: 'Pass code not found in campus database.' })
        }

        const isValid = ['Confirmed', 'Approved', 'Valid'].includes(data.status)
        return res.json({
          valid: isValid,
          booking: data,
          statusMessage: isValid ? 'Valid Campus Pass' : `Pass Invalid (${data.status})`
        })
      }

      return res.status(404).json({ valid: false, error: 'Database not connected to verify pass.' })
    } catch (err) {
      return res.status(500).json({ error: 'Server error verifying pass.', details: err.message })
    }
  }
}
