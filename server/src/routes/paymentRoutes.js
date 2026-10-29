import { Router } from 'express'
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus
} from '../controllers/paymentController.js'

const router = Router()

router.post('/create-order', createPaymentOrder)
router.post('/verify', verifyPayment)
router.get('/status/:orderId', getPaymentStatus)

export default router
