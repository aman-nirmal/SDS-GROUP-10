import React, { useState, useEffect } from 'react'
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  X
} from 'lucide-react'
import { authApi } from '../lib/api'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function ForgotPasswordModal({ isOpen, onClose, onPasswordResetSuccess, initialEmail = '' }) {
  // Steps: 'email' (Step 2) | 'verify' (Step 3 & 4) | 'reset' (Step 5) | 'success' (Step 6)
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState(initialEmail)
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetToken, setResetToken] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successNotice, setSuccessNotice] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [initialEmail])

  useEffect(() => {
    let interval = null
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [resendCooldown])

  if (!isOpen) return null

  // Step 2: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')
    setSuccessNotice('')

    const trimmedEmail = email.trim().toLowerCase()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

    if (!trimmedEmail || !isEmail) {
      setErrorMessage('Please enter a valid institutional email address.')
      return
    }

    setIsLoading(true)
    try {
      // 1. Supabase Auth password recovery trigger if configured
      if (supabase && isSupabaseConfigured && typeof supabase.auth?.resetPasswordForEmail === 'function') {
        try {
          await supabase.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: window.location.origin
          })
        } catch {
          // Continue to backend code generation
        }
      }

      // 2. Dispatch secure code via API
      const res = await authApi.forgotPasswordSendCode(trimmedEmail)
      setSuccessNotice(
        res.message || 'If an account exists, a 6-digit verification code has been dispatched.'
      )
      setResendCooldown(60)
      setStep('verify')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 4: Verify the 6-Digit OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')
    setSuccessNotice('')

    const cleanCode = otpCode.trim()
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.')
      return
    }

    setIsLoading(true)
    try {
      // Supabase Auth verifyOtp if available
      if (supabase && isSupabaseConfigured && typeof supabase.auth?.verifyOtp === 'function') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: cleanCode,
            type: 'recovery'
          })
          if (!error) {
            console.log('[Supabase Auth] Recovery OTP verified.')
          }
        } catch {
          // fallback to backend
        }
      }

      const res = await authApi.forgotPasswordVerifyCode(email.trim().toLowerCase(), cleanCode)
      setResetToken(res.resetToken || 'verified-session')
      setStep('reset')
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code. Please check your inbox.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 5 & 6: Set New Password & Update
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')

    if (!newPassword) {
      setErrorMessage('Please enter a new password.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-type.')
      return
    }

    setIsLoading(true)
    try {
      // Supabase Auth update user password
      if (supabase && isSupabaseConfigured && typeof supabase.auth?.updateUser === 'function') {
        try {
          await supabase.auth.updateUser({ password: newPassword })
        } catch {
          // continue to backend update
        }
      }

      await authApi.forgotPasswordReset(email.trim().toLowerCase(), resetToken, newPassword)
      setStep('success')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturnToLogin = () => {
    if (typeof onPasswordResetSuccess === 'function') {
      onPasswordResetSuccess(email.trim().toLowerCase())
    }
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Password Recovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                COEP Campus Account Verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successNotice && !errorMessage && step !== 'success' && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* STEP 2: ENTER EMAIL */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Registered University Email
              </label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="name@coeptech.ac.in"
                  className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                We will dispatch a secure 6-digit recovery code to your registered inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching Code...</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3 & 4: VERIFY 6-DIGIT CODE */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="forgot-otp"
                  className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setErrorMessage('')
                    setSuccessNotice('')
                  }}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change Email</span>
                </button>
              </div>

              <input
                id="forgot-otp"
                type="text"
                maxLength={6}
                autoFocus
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ''))
                  if (errorMessage) setErrorMessage('')
                }}
                placeholder="Enter 6-digit code"
                className="w-full h-12 text-center tracking-[0.3em] font-mono text-base font-extrabold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 text-center">
                Code sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify Code & Continue</span>
              )}
            </button>

            <div className="text-center text-xs pt-1">
              {resendCooldown > 0 ? (
                <span className="text-slate-400 dark:text-slate-500">
                  Resend verification code in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Resend verification code
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 5: SET NEW PASSWORD */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="At least 6 characters"
                  className="w-full h-11 px-3 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
                placeholder="Re-enter your new password"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 6: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Password Reset Complete!
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
              Your password has been reset successfully. Please log in with your new password.
            </p>

            <button
              type="button"
              onClick={handleReturnToLogin}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
