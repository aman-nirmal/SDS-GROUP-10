import { dataStore } from '../services/dataStore.js'
import { sendPassEmail, sendBookingUpdateEmail } from '../services/emailService.js'

export async function getAllBookings(req, res, next) {
  try {
    const { status, userEmail, venueName, date, search } = req.query
    const bookings = await dataStore.getBookings({ status, userEmail, venueName, date, search })
    return res.json({ success: true, count: bookings.length, bookings })
  } catch (err) {
    next(err)
  }
}

export async function checkAvailability(req, res, next) {
  try {
    const { venueName, date } = req.query
    if (!venueName || !date) {
      return res.status(400).json({ success: false, error: 'Missing venueName or date parameter.' })
    }
    const availability = await dataStore.getVenueAvailability(venueName, date)
    return res.json({ success: true, venueName, date, ...availability })
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
    const {
      venueName,
      venue,
      date,
      timeSlot,
      purpose,
      title,
      applicantName,
      applicantEmail,
      applicantRole,
      department,
      attendees,
      requirements,
      notes,
      digitalPassCode,
      passCode,
      ref,
      status
    } = req.body

    const targetVenue = venueName || venue
    if (!targetVenue || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Missing required reservation fields: venue, date, and timeSlot.'
      })
    }

    const booking = await dataStore.createBooking({
      ref,
      venueName: targetVenue,
      date,
      timeSlot,
      purpose: purpose || title || 'Academic Session',
      applicantName,
      applicantEmail,
      applicantRole,
      department,
      attendees,
      digitalPassCode: digitalPassCode || passCode,
      passCode: digitalPassCode || passCode,
      status: status || 'Pending',
      notes: notes || requirements
    })

    // Asynchronously dispatch email notification
    if (booking && booking.applicantEmail) {
      const isConfirmed = booking.status === 'Confirmed' || booking.status === 'Approved'
      if (isConfirmed || booking.digitalPassCode) {
        sendPassEmail({
          to: booking.applicantEmail,
          holderName: booking.applicantName,
          role: booking.applicantRole,
          passCode: booking.digitalPassCode || booking.ref,
          venue: booking.venueName,
          purpose: booking.purpose,
          date: booking.date,
          timeSlot: booking.timeSlot,
          attendees: booking.attendees
        }).catch((err) => console.warn('[Email Dispatch Error]:', err.message))
      } else {
        sendBookingUpdateEmail({
          to: booking.applicantEmail,
          recipientName: booking.applicantName,
          bookingRef: booking.ref,
          venue: booking.venueName,
          date: booking.date,
          timeSlot: booking.timeSlot,
          status: booking.status,
          purpose: booking.purpose
        }).catch((err) => console.warn('[Email Dispatch Error]:', err.message))
      }
    }

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

    // Asynchronously dispatch booking status update email
    if (updated.applicantEmail) {
      sendBookingUpdateEmail({
        to: updated.applicantEmail,
        recipientName: updated.applicantName,
        bookingRef: updated.ref || updated.id,
        venue: updated.venueName || updated.venue,
        date: updated.date,
        timeSlot: updated.timeSlot,
        status: updated.status,
        purpose: updated.purpose,
        decisionNotes: reason || notes || updated.decisionNotes,
        decidedBy: actor || updated.decidedBy || 'Staff Reviewer'
      }).catch((err) => console.warn('[Status Email Dispatch Error]:', err.message))
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

/**
 * Direct API endpoint to trigger a pass email with QR code
 */
export async function sendPassEmailDirect(req, res, next) {
  try {
    const {
      email,
      passCode,
      venue,
      purpose,
      date,
      timeSlot,
      attendees,
      holderName,
      role
    } = req.body

    const targetEmail = (email || '').trim().toLowerCase()
    if (!targetEmail) {
      return res.status(400).json({ success: false, error: 'Recipient email is required.' })
    }

    const result = await sendPassEmail({
      to: targetEmail,
      holderName: holderName || 'Verified Student',
      role: role || 'Student',
      passCode: passCode || 'COEP-GATE-PASS',
      venue: venue || 'Campus Facility',
      purpose: purpose || 'Academic Access',
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || 'Active Window',
      attendees: attendees || 1
    })

    return res.json({
      success: true,
      message: `Pass dispatched to ${targetEmail}`,
      provider: result.provider,
      error: result.error
    })
  } catch (err) {
    next(err)
  }
}
