import assert from 'node:assert/strict'
import test from 'node:test'
import { bookingsApi, normalizeBooking, OFFICIAL_CLUB_MAPPINGS } from '../src/lib/bookingsApi.js'
import { isSupabaseConfigured, SUPABASE_URL } from '../src/lib/supabase.js'

test('Supabase Configuration Check', () => {
  assert.equal(SUPABASE_URL, 'https://ozdthbfemtuaefrrxwnm.supabase.co')
  assert.ok(SUPABASE_URL.includes('ozdthbfemtuaefrrxwnm'))
})

test('normalizeBooking maps both DB snake_case and UI camelCase correctly', () => {
  const dbRow = {
    id: 'uuid-123',
    booking_ref: 'LOCUS-999888',
    applicant_name: 'Dr. V. K. Kulkarni',
    applicant_email: 'faculty@coeptech.ac.in',
    user_role: 'Faculty',
    department: 'Computer Engineering',
    venue_name: 'ND01 (North Drawing Hall)',
    old_venue_name: 'Hall 1',
    booking_date: '2026-10-30',
    time_slot: '09:00 AM - 11:00 AM',
    purpose: 'Distributed Systems Viva',
    attendees: 60,
    status: 'Confirmed',
    digital_pass_code: 'COEP-PASS-1234'
  }

  const normalized = normalizeBooking(dbRow)

  // DB schema fields
  assert.equal(normalized.booking_ref, 'LOCUS-999888')
  assert.equal(normalized.applicant_email, 'faculty@coeptech.ac.in')
  assert.equal(normalized.venue_name, 'ND01 (North Drawing Hall)')
  assert.equal(normalized.status, 'Confirmed')

  // UI camelCase compatibility fields
  assert.equal(normalized.ref, 'LOCUS-999888')
  assert.equal(normalized.venueName, 'ND01 (North Drawing Hall)')
  assert.equal(normalized.venue, 'ND01 (North Drawing Hall)')
  assert.equal(normalized.applicantName, 'Dr. V. K. Kulkarni')
  assert.equal(normalized.date, '2026-10-30')
  assert.equal(normalized.slot, '09:00 AM - 11:00 AM')
  assert.equal(normalized.capacity, 60)
  assert.equal(normalized.passId, 'COEP-PASS-1234')
})

test('Validation: Invalid booking input is rejected', async () => {
  // Missing venue
  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: '',
        applicantName: 'Test Student',
        applicantEmail: 'student@coeptech.ac.in',
        date: '2026-10-29',
        slot: '10:00 AM - 12:00 PM',
        purpose: 'Study'
      }, { email: 'student@coeptech.ac.in' })
    },
    /select a valid campus venue/
  )

  // Missing purpose
  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: 'SC06',
        applicantName: 'Test Student',
        applicantEmail: 'student@coeptech.ac.in',
        date: '2026-10-29',
        slot: '10:00 AM - 12:00 PM',
        purpose: ''
      }, { email: 'student@coeptech.ac.in' })
    },
    /purpose or session topic is required/
  )

  // Invalid date
  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: 'SC06',
        applicantName: 'Test Student',
        applicantEmail: 'student@coeptech.ac.in',
        date: 'not-a-date',
        slot: '10:00 AM - 12:00 PM',
        purpose: 'Study'
      }, { email: 'student@coeptech.ac.in' })
    },
    /Invalid reservation date format/
  )
})

test('Lifecycle: Create booking, persist, and retrieve by authorized account', async () => {
  const studentUser = {
    id: 'STU-2026-101',
    name: 'Aman Nirmal',
    email: 'student@coeptech.ac.in',
    role: 'Student',
    department: 'Computer Engineering'
  }

  const bookingData = {
    venueName: 'SC06 Classroom',
    purpose: 'Automated Test: End-to-End Booking Lifecycle',
    date: '2026-11-01',
    slot: '02:00 PM - 04:00 PM',
    capacity: 35
  }

  const created = await bookingsApi.createBooking(bookingData, studentUser)
  assert.ok(created)
  assert.ok(created.ref.startsWith('LOCUS-'))
  assert.equal(created.applicantEmail, 'student@coeptech.ac.in')
  assert.equal(created.status, 'Confirmed')

  // Retrieve student's bookings
  const studentBookings = await bookingsApi.fetchUserBookings(studentUser)
  const found = studentBookings.find((b) => b.ref === created.ref)
  assert.ok(found, 'Created booking should be retrieved in student bookings list')
  assert.equal(found.venueName, 'SC06 Classroom')
})

test('Authorization: User A cannot see User B private bookings', async () => {
  const userA = {
    id: 'USR-A',
    name: 'Student A',
    email: 'student.a@coeptech.ac.in',
    role: 'Student'
  }

  const userB = {
    id: 'USR-B',
    name: 'Student B',
    email: 'student.b@coeptech.ac.in',
    role: 'Student'
  }

  // Create booking for user B
  const bookingB = await bookingsApi.createBooking({
    venueName: 'NC01',
    purpose: 'Private Study Session for User B',
    date: '2026-11-02',
    slot: '10:00 AM - 12:00 PM'
  }, userB)

  // Retrieve user A's bookings
  const bookingsA = await bookingsApi.fetchUserBookings(userA)
  const leakFound = bookingsA.some((b) => b.ref === bookingB.ref)
  assert.equal(leakFound, false, "User A must NOT see User B's private bookings")
})

test('Club Authorization: MindSpark lead only sees MindSpark bookings, not ZEST', async () => {
  const mindsparkLead = {
    id: 'CLUB-MS-26',
    name: 'MindSpark Lead',
    email: 'mindspark@coeptech.ac.in',
    role: 'Club Lead',
    club_name: 'MindSpark'
  }

  const zestLead = {
    id: 'CLUB-ZEST-01',
    name: 'ZEST Sports Lead',
    email: 'zest@coeptech.ac.in',
    role: 'Club Lead',
    club_name: 'ZEST'
  }

  // Create booking for MindSpark
  const msBooking = await bookingsApi.createBooking({
    venueName: 'BHAU Main Auditorium',
    purpose: 'MindSpark Hackathon Keynote',
    date: '2026-11-15',
    slot: '09:00 AM - 05:00 PM',
    clubName: 'MindSpark'
  }, mindsparkLead)

  // Create booking for ZEST
  const zestBooking = await bookingsApi.createBooking({
    venueName: 'Boat Club Grounds',
    purpose: 'ZEST Regatta Opening',
    date: '2026-11-20',
    slot: '08:00 AM - 12:00 PM',
    clubName: 'ZEST'
  }, zestLead)

  // MindSpark lead fetches bookings
  const msBookings = await bookingsApi.fetchUserBookings(mindsparkLead)
  assert.ok(msBookings.some((b) => b.ref === msBooking.ref), 'MindSpark lead sees MindSpark booking')
  assert.equal(msBookings.some((b) => b.ref === zestBooking.ref), false, 'MindSpark lead must NOT see ZEST booking')
})

test('Status Update: Cancel booking updates status to Cancelled', async () => {
  const user = {
    id: 'FAC-1042',
    name: 'Dr. V. K. Kulkarni',
    email: 'faculty@coeptech.ac.in',
    role: 'Faculty'
  }

  const booking = await bookingsApi.createBooking({
    venueName: 'ND01',
    purpose: 'Capstone Project Discussion',
    date: '2026-11-10',
    slot: '02:00 PM - 04:00 PM'
  }, user)

  assert.equal(booking.status, 'Confirmed')

  // Cancel booking
  const updated = await bookingsApi.cancelBooking(booking.ref, user)
  assert.equal(updated.status, 'Cancelled')

  // Re-fetch bookings
  const bookings = await bookingsApi.fetchUserBookings(user)
  const found = bookings.find((b) => b.ref === booking.ref)
  assert.equal(found.status, 'Cancelled')
})

test('Security Gate Pass: Verification of digital pass codes', async () => {
  const student = {
    id: 'STU-99',
    name: 'Gaurang Gohil',
    email: 'gaurang@coeptech.ac.in',
    role: 'Student'
  }

  const booking = await bookingsApi.createBooking({
    venueName: 'Central Library Room A',
    purpose: 'Study & Research',
    date: '2026-11-12',
    slot: '10:00 AM - 12:00 PM',
    status: 'Approved'
  }, student)

  // Test verify pass by digital pass code
  const result = await bookingsApi.verifyPass(booking.digitalPassCode)
  assert.equal(result.valid, true)
  assert.equal(result.booking.applicantName, 'Gaurang Gohil')

  // Test verify invalid pass
  const invalidResult = await bookingsApi.verifyPass('NON-EXISTENT-PASS')
  assert.equal(invalidResult.valid, false)
})
