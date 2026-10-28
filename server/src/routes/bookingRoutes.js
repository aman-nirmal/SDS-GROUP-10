import { Router } from 'express'
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  verifyPass
} from '../controllers/bookingController.js'

const router = Router()

router.get('/', getAllBookings)
router.get('/verify-pass/:passCode', verifyPass)
router.get('/:id', getBookingById)
router.post('/', createBooking)
router.patch('/:id/status', updateBookingStatus)
router.put('/:id/status', updateBookingStatus)
router.delete('/:id', deleteBooking)

export default router
