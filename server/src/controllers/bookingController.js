import { dataStore } from '../services/dataStore.js'

export async function getAllBookings(req, res, next) {
  try {
    const { status, userEmail, venueName, date, search } = req.query
    const bookings = await dataStore.getBookings({ status, userEmail, venueName, date, search })
    return res.json({ success: true, count: bookings.length, bookings })
  } catch (err) {
    next(err)
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await dataStore.getBookingById(req.params.id)
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }
    return res.json({ success: true, booking })
  } catch (err) {
    next(err)
  }
}

export async function createBooking(req, res, next) {
  try {
    const { venueName, venue, date, timeSlot, purpose, title, applicantName, applicantEmail, applicantRole, department, attendees, requirements, notes } = req.body

    const targetVenue = venueName || venue
    if (!targetVenue || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Missing required reservation fields: venue, date, and timeSlot.'
      })
    }

    const booking = await dataStore.createBooking({
      venueName: targetVenue,
      date,
      timeSlot,
      purpose: purpose || title || 'Academic Session',
      applicantName,
      applicantEmail,
      applicantRole,
      department,
      attendees,
      notes: notes || requirements
    })

    return res.status(201).json({ success: true, booking })
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ success: false, error: err.message, isConflict: true })
    }
    next(err)
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { status, reason, notes, actor } = req.body
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' })
    }

    const updated = await dataStore.updateBookingStatus(
      req.params.id,
      status,
      reason || notes || '',
      actor || req.body.decidedBy || 'Staff Reviewer'
    )

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }

    return res.json({ success: true, booking: updated })
  } catch (err) {
    next(err)
  }
}

export async function deleteBooking(req, res, next) {
  try {
    const deleted = await dataStore.deleteBooking(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Booking not found.' })
    }
    return res.json({ success: true, message: 'Booking reservation deleted successfully.' })
  } catch (err) {
    next(err)
  }
}

export async function verifyPass(req, res, next) {
  try {
    const { passCode } = req.params
    const pass = await dataStore.verifyPass(passCode)
    if (!pass) {
      return res.status(404).json({
        success: false,
        isValid: false,
        error: 'No valid digital pass or confirmed booking found for this code.'
      })
    }
    return res.json({ success: true, ...pass })
  } catch (err) {
    next(err)
  }
}
