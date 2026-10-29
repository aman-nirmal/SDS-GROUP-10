import { Router } from 'express'
import { authController } from '../controllers/authController.js'

const router = Router()

router.post('/verify-email', authController.verifyEmail)
router.post('/send-otp', authController.sendOtp)
router.post('/verify-otp', authController.verifyOtp)
router.get('/verify-link', authController.verifyLink)
router.post('/outlook', authController.outlookAuth)
router.post('/login', authController.login)
router.post('/forgot-password/send-code', authController.forgotPasswordSendCode)
router.post('/forgot-password/verify-code', authController.forgotPasswordVerifyCode)
router.post('/forgot-password/reset-password', authController.forgotPasswordReset)

export default router
