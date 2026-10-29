import React, { useState, useEffect } from 'react'
import {
  Mail,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { MicrosoftLogo, OutlookLogo } from './MicrosoftLogo'
import { loginWithOutlook, clearStaleMsalInteractionStatus } from '../../lib/msalConfig'
import { authApi } from '../../lib/api'

export const OFFICIAL_COEP_ACCOUNTS = [
  {
    role: 'Administrator',
    email: 'admin@coeptech.ac.in',
    password: 'Password@123',
    name: 'Central Estate Admin',
    department: 'Central Estate & Infrastructure',
    id: 'ADM-001'
  },
  {
    role: 'Head of Department (HOD)',
    email: 'hod.civil@coeptech.ac.in',
    password: 'Password@123',
    name: 'Dr. Balkrishna M. Dawari',
    department: 'Civil Engineering',
    id: 'HOD-CIVIL-01'
  },
  {
    role: 'Head of Department (HOD)',
    email: 'hod.comp@coeptech.ac.in',
    password: 'Password@123',
    name: 'Dr. V. K. Pachghare',
    department: 'Computer Engineering',
    id: 'HOD-COMP-01'
  },
  {
    role: 'Dean',
    email: 'dean.academics@coeptech.ac.in',
    password: 'Password@123',
    name: 'Dr. P. R. Dhamangaonkar',
    department: 'Office of the Dean (Academics & Student Affairs)',
    id: 'DEAN-ACAD-01'
  },
  {
    role: 'Faculty',
    email: 'faculty@coeptech.ac.in',
    password: 'Password@123',
    name: 'Dr. V. K. Kulkarni',
    department: 'Computer Engineering',
    id: 'FAC-1042'
  },
  {
    role: 'Club Lead',
    email: 'mindspark@coeptech.ac.in',
    password: 'Password@123',
    name: 'MindSpark Secretarial Lead',
    department: 'Technical Events Secretariat',
    id: 'CLUB-MS-26'
  },
  {
    role: 'Student',
    email: 'student@coeptech.ac.in',
    password: 'Password@123',
    name: 'Aman Nirmal',
    department: 'Computer Engineering',
    id: 'STU-2026-101'
  },
  {
    role: 'Security Guard',
    email: 'security@coeptech.ac.in',
    password: 'Password@123',
    name: 'Officer S. Patil',
    department: 'Campus Security & Gate 1 Control',
    id: 'SEC-G1-04'
  }
]

export function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [authMethod, setAuthMethod] = useState('password') // 'password' | 'otp'
  const [password, setPassword] = useState('')
  const [role] = useState('Student')
  const [errorMessage, setErrorMessage] = useState('')
  const [successNotice, setSuccessNotice] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // OTP flow states
  const [otpCode, setOtpCode] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

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

  useEffect(() => {
    clearStaleMsalInteractionStatus()
  }, [])

  // 1. One-Click Authentic Microsoft 365 / Outlook Sign-In
  const handleOutlookSignIn = async () => {
    setErrorMessage('')
    setSuccessNotice('')
    setIsVerifying(true)

    try {
      const result = await loginWithOutlook()
      if (result && result.userProfile) {
        setSuccessNotice(`Signed in as ${result.userProfile.name}`)
        try {
          await authApi.outlookLogin(result.userProfile.email, result.userProfile.role)
        } catch {
          // Sync fallback
        }
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(result.userProfile)
        }
      }
    } catch (err) {
      if (err.code === 'USER_CANCELLED') {
        setErrorMessage('Microsoft sign-in was closed before completion.')
      } else if (err.code === 'NON_INSTITUTIONAL_DOMAIN') {
        setErrorMessage(err.message)
      } else if (err.code === 'AZURE_NOT_CONFIGURED' || err.message === 'AZURE_NOT_CONFIGURED') {
        setErrorMessage('Azure Entra ID client ID is not configured. Add VITE_AZURE_CLIENT_ID to .env.local or sign in with University Password / OTP.')
      } else if (err.message && err.message.includes('AADSTS50011')) {
        setErrorMessage('Azure Redirect URI mismatch. Ensure http://localhost:5173/ is registered as SPA in Azure.')
      } else {
        setErrorMessage(err.message || 'Outlook authentication could not be completed.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  // 2. Standard Institutional Password Sign-In
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')
    setSuccessNotice('')

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setErrorMessage('Please enter your university email address.')
      return
    }

    if (!trimmedEmail.endsWith('@coeptech.ac.in') && !trimmedEmail.endsWith('@coep.ac.in')) {
      setErrorMessage('Please use your official @coeptech.ac.in or @coep.ac.in university email.')
      return
    }

    if (!password.trim()) {
      setErrorMessage('Password cannot be blank.')
      return
    }

    setIsVerifying(true)

    // Check predefined institutional accounts
    const matchedAccount = OFFICIAL_COEP_ACCOUNTS.find((acc) => acc.email === trimmedEmail)
    if (matchedAccount) {
      if (password !== matchedAccount.password) {
        setIsVerifying(false)
        setErrorMessage('Incorrect password. Please verify your credentials.')
        return
      }

      const userProfile = {
        id: matchedAccount.id,
        name: matchedAccount.name,
        email: matchedAccount.email,
        role: matchedAccount.role,
        department: matchedAccount.department,
        authProvider: 'password',
        authenticatedAt: new Date().toISOString()
      }

      try {
        await authApi.login(trimmedEmail, password, matchedAccount.role)
      } catch {
        // Fallback
      }

      setTimeout(() => {
        setIsVerifying(false)
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(userProfile)
        }
      }, 350)
      return
    }

    // Other valid campus users
    try {
      const res = await authApi.login(trimmedEmail, password, role)
      const userProfile = res?.user || {
        id: `COEP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: trimmedEmail.split('@')[0],
        email: trimmedEmail,
        role: trimmedEmail.includes('admin')
          ? 'Administrator'
          : (trimmedEmail.includes('hod') || trimmedEmail.startsWith('hod.'))
            ? 'Head of Department (HOD)'
            : (trimmedEmail.includes('dean') || trimmedEmail.startsWith('dean.'))
              ? 'Dean'
              : trimmedEmail.includes('faculty')
                ? 'Faculty'
                : trimmedEmail.includes('security')
                  ? 'Security Guard'
                  : trimmedEmail.includes('mindspark') || trimmedEmail.includes('club')
                    ? 'Club Lead'
                    : role,
        department: trimmedEmail.includes('security') ? 'Campus Security & Gate 1 Control' : 'COEP Technological University',
        authProvider: 'password',
        authenticatedAt: new Date().toISOString()
      }

      setTimeout(() => {
        setIsVerifying(false)
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(userProfile)
        }
      }, 350)
    } catch (err) {
      setIsVerifying(false)
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.')
    }
  }

  // 3. Dispatch 6-digit OTP
  const handleSendOtp = async () => {
    setErrorMessage('')
    const trimmedEmail = email.trim().toLowerCase()

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    if (!trimmedEmail || !isValidEmail) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await authApi.sendOtp(trimmedEmail)
      setIsOtpSent(true)
      setResendCooldown(45)
      setSuccessNotice(res.message || `Verification code sent to ${trimmedEmail}`)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch verification email.')
    } finally {
      setIsVerifying(false)
    }
  }

  // 4. Verify entered 6-digit OTP code
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    setErrorMessage('')

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await authApi.verifyOtp(email.trim().toLowerCase(), otpCode.trim(), role)
      if (res.user && typeof onLoginSuccess === 'function') {
        onLoginSuccess(res.user)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          COEP Campus Sign In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Access campus venues, auditoriums, and reservation records.
        </p>
      </div>

      {/* Prominent "Sign in with Outlook" SSO Action Button */}
      <div className="mb-5">
        <button
          type="button"
          onClick={handleOutlookSignIn}
          disabled={isVerifying}
          className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 border border-transparent dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <MicrosoftLogo className="w-4 h-4" />
            <OutlookLogo className="w-4 h-4" />
          </div>
          <span>{isVerifying ? 'Authenticating with Microsoft...' : 'Sign in with Microsoft 365 / Outlook'}</span>
        </button>
      </div>

      {/* Visual Divider */}
      <div className="relative my-5 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          or sign in with credentials
        </span>
      </div>

      {/* Auth Method Toggle */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('password')
            setErrorMessage('')
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${authMethod === 'password'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          University Password
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod('otp')
            setErrorMessage('')
          }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${authMethod === 'otp'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          Email OTP
        </button>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification Alert */}
      {successNotice && !errorMessage && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* =========================================================================
          FLOW A: PASSWORD AUTHENTICATION (DEFAULT)
          ========================================================================= */}
      {authMethod === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password-university-email"
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              University Email
            </label>
            <input
              id="password-university-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="name@coeptech.ac.in"
              disabled={isVerifying}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password-input"
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              placeholder="Enter password"
              disabled={isVerifying}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {isVerifying ? 'Authenticating...' : 'Sign In with University Account'}
          </button>
        </form>
      )}

      {/* =========================================================================
          FLOW B: EMAIL OTP VERIFICATION
          ========================================================================= */}
      {authMethod === 'otp' && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="otp-university-email"
              className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Institutional Email
            </label>
            <div className="relative">
              <input
                id="otp-university-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
                placeholder="name@coeptech.ac.in"
                disabled={isVerifying || isOtpSent}
                className="w-full h-11 px-3 pl-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {isOtpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpSent(false)
                    setOtpCode('')
                    setSuccessNotice('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {!isOtpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isVerifying}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching code...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Verification Code</span>
                </>
              )}
            </button>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="six-digit-otp"
                  className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="six-digit-otp"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  autoFocus
                  disabled={isVerifying}
                  className="w-full h-12 text-center tracking-[0.3em] font-mono text-base font-extrabold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[11px] text-slate-500 text-center mt-1.5">
                  Enter the 6-digit verification code dispatched to your institutional inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <span>Verify Code & Enter</span>
                )}
              </button>

              <div className="text-center text-xs">
                {resendCooldown > 0 ? (
                  <span className="text-slate-400 dark:text-slate-500">Resend code in {resendCooldown}s</span>
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
        </div>
      )}
    </div>
  )
}

export default LoginForm

