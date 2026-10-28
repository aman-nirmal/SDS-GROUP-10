import express from 'express'
import { bookingController } from '../controllers/bookingController.js'

const router = express.Router()

router.get('/', bookingController.getBookings)
router.post('/', bookingController.createBooking)
router.patch('/:id/status', bookingController.updateStatus)
router.get('/verify-pass/:code', bookingController.verifyPass)

export default router
