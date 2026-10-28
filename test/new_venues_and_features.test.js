import assert from 'node:assert/strict'
import test from 'node:test'
import { bookingsApi } from '../src/lib/bookingsApi.js'
import { INITIAL_ADMIN_VENUES } from '../src/components/admin/mockAdminData.js'
import { authApi } from '../src/lib/api.js'

test('1. Venue Tests: Cognizant Lab and Mini Auditorium Configuration', () => {
  // Check Cognizant Lab in INITIAL_ADMIN_VENUES
  const cogLab = INITIAL_ADMIN_VENUES.find((v) => v.code === 'COG-LAB' || v.name === 'Cognizant Lab')
  assert.ok(cogLab, 'Cognizant Lab should exist in venue data')
  assert.equal(cogLab.name, 'Cognizant Lab')
  assert.equal(cogLab.code, 'COG-LAB')
  assert.equal(cogLab.type, 'Lab')
  assert.equal(cogLab.capacity, 400, 'Cognizant Lab capacity must be 400')
  assert.equal(cogLab.benches, 200)
  assert.equal(cogLab.department, 'Computer Engineering')
  assert.equal(cogLab.building, 'Computer New Building')
  assert.equal(cogLab.status, 'Available')
  assert.equal(cogLab.isActive, true)
  assert.ok(cogLab.description.includes('computer laboratory'))

  // Check Mini Auditorium in INITIAL_ADMIN_VENUES
  const miniAud = INITIAL_ADMIN_VENUES.find((v) => v.code === 'MINI-AUD' || v.name === 'Mini Auditorium')
  assert.ok(miniAud, 'Mini Auditorium should exist in venue data')
  assert.equal(miniAud.name, 'Mini Auditorium')
  assert.equal(miniAud.code, 'MINI-AUD')
  assert.equal(miniAud.type, 'Auditorium')
  assert.equal(miniAud.capacity, 275, 'Mini Auditorium capacity must be 275')
  assert.ok(miniAud.capacity >= 250 && miniAud.capacity <= 300, 'Capacity within 250-300 range')
  assert.equal(miniAud.benches, 138)
  assert.equal(miniAud.department, 'Academics Complex')
  assert.equal(miniAud.building, 'Main Heritage Building')
  assert.equal(miniAud.status, 'Available')
  assert.equal(miniAud.isActive, true)
  assert.ok(miniAud.description.includes('mini auditorium'))
})

test('2. Role-Based Permissions: Authorized roles can submit bookings', async () => {
  // A. Administrator
  const adminUser = {
    id: 'ADM-001',
    name: 'Central Estate Admin',
    email: 'admin@coeptech.ac.in',
    role: 'Administrator',
    department: 'Central Estate & Infrastructure'
  }
  const adminBooking = await bookingsApi.createBooking({
    venueName: 'Cognizant Lab',
    purpose: 'Faculty Training on Generative AI',
    date: '2026-11-20',
    slot: '09:00 AM - 11:00 AM',
    capacity: 120
  }, adminUser)
  assert.ok(adminBooking)
  assert.equal(adminBooking.applicantEmail, 'admin@coeptech.ac.in')
  assert.equal(adminBooking.venueName, 'Cognizant Lab')

  // B. Faculty
  const facultyUser = {
    id: 'FAC-1042',
    name: 'Dr. V. K. Kulkarni',
    email: 'faculty@coeptech.ac.in',
    role: 'Faculty',
    department: 'Computer Engineering'
  }
  const facultyBooking = await bookingsApi.createBooking({
    venueName: 'Mini Auditorium',
    purpose: 'Machine Learning Seminar',
    date: '2026-11-21',
    slot: '11:00 AM - 01:00 PM',
    capacity: 150
  }, facultyUser)
  assert.ok(facultyBooking)
  assert.equal(facultyBooking.applicantEmail, 'faculty@coeptech.ac.in')
  assert.equal(facultyBooking.venueName, 'Mini Auditorium')

  // C. Club Lead
  const clubLeadUser = {
    id: 'CLUB-MS-26',
    name: 'MindSpark Secretarial Lead',
    email: 'mindspark@coeptech.ac.in',
    role: 'Club Lead',
    club_name: 'MindSpark'
  }
  const clubBooking = await bookingsApi.createBooking({
    venueName: 'Cognizant Lab',
    purpose: 'MindSpark 24-hr Hackathon Elimination Round',
    date: '2026-11-22',
    slot: '02:00 PM - 05:00 PM',
    capacity: 200,
    clubName: 'MindSpark'
  }, clubLeadUser)
  assert.ok(clubBooking)
  assert.equal(clubBooking.applicantEmail, 'mindspark@coeptech.ac.in')
  assert.equal(clubBooking.club_name, 'MindSpark')
})

test('3. Security Requirements: Unauthorized students and guests CANNOT submit bookings', async () => {
  // Regular student without qualifying booking role
  const unauthorizedStudent = {
    id: 'STU-UNAUTH-01',
    name: 'Rohan Sharma',
    email: 'rohan.comp@coep.ac.in',
    role: 'Student'
  }

  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: 'Cognizant Lab',
        purpose: 'Unauthorized Student Booking',
        date: '2026-11-23',
        slot: '09:00 AM - 11:00 AM',
        capacity: 50
      }, unauthorizedStudent)
    },
    (err) => {
      assert.ok(err.message.includes('permission to book this venue'))
      return true
    }
  )

  // Guest / Unauthenticated user
  const guestUser = {
    id: 'GUEST-999',
    name: 'External Visitor',
    email: 'visitor@external.com',
    role: 'Guest'
  }

  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: 'Mini Auditorium',
        purpose: 'External Guest Booking Attempt',
        date: '2026-11-24',
        slot: '02:00 PM - 04:00 PM',
        capacity: 100
      }, guestUser)
    },
    (err) => {
      assert.ok(err.message.includes('permission to book this venue'))
      return true
    }
  )
})

test('4. Conflict & Capacity Validation: Overlapping slots and over-capacity bookings are rejected', async () => {
  const facultyUser = {
    id: 'FAC-1042',
    name: 'Dr. V. K. Kulkarni',
    email: 'faculty@coeptech.ac.in',
    role: 'Faculty',
    department: 'Computer Engineering'
  }

  // A. Over-capacity test on Cognizant Lab (max 400)
  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: 'Cognizant Lab',
        purpose: 'Mass Gathering Exceeding Capacity',
        date: '2026-11-25',
        slot: '10:00 AM - 12:00 PM',
        capacity: 550 // exceeds 400!
      }, facultyUser)
    },
    /maximum capacity of Cognizant Lab \(400 persons\)/
  )

  // B. Over-capacity test on Mini Auditorium (max 275)
  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: 'Mini Auditorium',
        purpose: 'Conference Overfill',
        date: '2026-11-26',
        slot: '10:00 AM - 12:00 PM',
        capacity: 350 // exceeds 275!
      }, facultyUser)
    },
    /maximum capacity of Mini Auditorium \(275 persons\)/
  )

  // C. Conflict Prevention: first booking succeeds
  const initialBooking = await bookingsApi.createBooking({
    venueName: 'Mini Auditorium',
    purpose: 'Department Academic Session',
    date: '2026-11-27',
    slot: '02:00 PM - 04:00 PM',
    capacity: 200
  }, facultyUser)
  assert.ok(initialBooking)

  // Second booking on exact same venue, date, and slot must be rejected!
  await assert.rejects(
    async () => {
      await bookingsApi.createBooking({
        venueName: 'Mini Auditorium',
        purpose: 'Conflicting Academic Session',
        date: '2026-11-27',
        slot: '02:00 PM - 04:00 PM',
        capacity: 100
      }, facultyUser)
    },
    /already booked on 2026-11-27/
  )
})

test('5. Forgot Password: Verification code dispatch, validation, and password reset', async () => {
  const testEmail = 'faculty@coeptech.ac.in'

  // Step 2: Send OTP
  const sendRes = await authApi.forgotPasswordSendCode(testEmail)
  assert.equal(sendRes.success, true)
  assert.ok(sendRes.message.includes('code has been dispatched') || sendRes.message.includes('sent'))

  // Step 4: Verify OTP code (using sandbox test code 123456)
  const verifyRes = await authApi.forgotPasswordVerifyCode(testEmail, '123456')
  assert.equal(verifyRes.success, true)
  assert.ok(verifyRes.resetToken)

  // Invalid OTP code rejection
  await assert.rejects(
    async () => {
      await authApi.forgotPasswordVerifyCode(testEmail, '000000')
    },
    /Invalid verification code/
  )

  // Step 5: Password Reset
  const resetRes = await authApi.forgotPasswordReset(testEmail, verifyRes.resetToken, 'NewSecurePass@2026')
  assert.equal(resetRes.success, true)
  assert.ok(resetRes.message.includes('reset successfully'))

  // Password too short rejection
  await assert.rejects(
    async () => {
      await authApi.forgotPasswordReset(testEmail, 'some-token', '123')
    },
    /at least 6 characters/
  )
})
