import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { config } from '../config/env.js'
import { supabase } from '../config/supabase.js'

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null

const smtpTransporter = (config.smtpUser && config.smtpPass)
  ? nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass }
    })
  : null

// Ephemeral in-memory OTP store: email → { otp, token, expiresAt }
const activeVerifications = new Map()

// ─── Single source of truth: Supabase users table ──────────────────────────────
// NEVER derive roles from email substrings. Always query the DB.
async function lookupUserByEmail(email) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, is_active')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    if (error || !data) return null
    if (data.is_active === false) return null   // blocked accounts
    return data
  } catch (e) {
    console.error('[Auth] Supabase user lookup error:', e.message)
    return null
  }
}

function isInstitutionalEmail(email) {
  return email.endsWith('@coeptech.ac.in') || email.endsWith('@coep.ac.in')
}

// ─── Auth Controller ────────────────────────────────────────────────────────────
export const authController = {

  /**
   * Verify domain and check if email exists in DB.
   */
  async verifyEmail(req, res) {
    try {
      const { email } = req.body
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Valid email address is required.' })
      }

      const trimmedEmail = email.trim().toLowerCase()
      if (!isInstitutionalEmail(trimmedEmail)) {
        return res.status(400).json({
          error: 'Please use your official @coeptech.ac.in or @coep.ac.in institutional email address.'
        })
      }

      const dbUser = await lookupUserByEmail(trimmedEmail)
      return res.json({
        email: trimmedEmail,
        status: dbUser ? 'existing' : 'new',
        message: dbUser
          ? 'Existing university account found.'
          : 'No account found for this email. Contact your administrator.'
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to verify email.' })
    }
  },

  /**
   * Generate and dispatch a 6-digit OTP.
   */
  async sendOtp(req, res) {
    try {
      const { email } = req.body
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email address is required.' })
      }

      const trimmedEmail = email.trim().toLowerCase()
      if (!isInstitutionalEmail(trimmedEmail)) {
        return res.status(400).json({
          error: 'OTP is only available for @coeptech.ac.in or @coep.ac.in addresses.'
        })
      }

      // Verify the email exists in DB before sending OTP
      const dbUser = await lookupUserByEmail(trimmedEmail)
      if (!dbUser) {
        return res.status(404).json({
          error: 'No account found for this email. Contact your administrator to register.'
        })
      }

      // Generate cryptographically secure 6-digit OTP
      const generatedOtp = String(crypto.randomInt(100000, 999999))
      const verificationToken = crypto.randomBytes(32).toString('hex')

      activeVerifications.set(trimmedEmail, {
        otp: generatedOtp,
        token: verificationToken,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      })

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f9f8f6;border-radius:12px;">
          <h2 style="color:#1e3a5f;margin-bottom:8px;">COEP LOCUS Verification</h2>
          <p style="color:#555;font-size:14px;">Your verification code is:</p>
          <div style="background:#fff;border:2px solid #1e3a5f;border-radius:8px;text-align:center;padding:20px;margin:16px 0;">
            <span style="font-size:36px;font-weight:900;color:#1e3a5f;letter-spacing:8px;">${generatedOtp}</span>
          </div>
          <p style="color:#777;font-size:12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>`

      let emailDispatched = false
      let dispatchError = null

      if (smtpTransporter) {
        try {
          const fromAddress = config.smtpFrom || `"COEP LOCUS" <${config.smtpUser}>`
          await smtpTransporter.sendMail({
            from: fromAddress,
            to: trimmedEmail,
            subject: `${generatedOtp} is your COEP LOCUS verification code`,
            html: emailHtml
          })
          emailDispatched = true
        } catch (smtpErr) {
          console.warn(`[SMTP Error for ${trimmedEmail}]:`, smtpErr.message)
          dispatchError = smtpErr.message
        }
      }

      if (!emailDispatched && resend) {
        try {
          const emailResponse = await resend.emails.send({
            from: config.resendFromEmail || 'COEP LOCUS <onboarding@resend.dev>',
            to: trimmedEmail,
            subject: `${generatedOtp} is your COEP LOCUS verification code`,
            html: emailHtml
          })
          if (emailResponse?.error) {
            dispatchError = emailResponse.error.message
          } else {
            emailDispatched = true
          }
        } catch (resendErr) {
          dispatchError = resendErr.message
        }
      }

      return res.json({
        success: true,
        message: emailDispatched
          ? `Verification code sent to ${trimmedEmail}.`
          : `Verification code generated for ${trimmedEmail}.`,
        email: trimmedEmail,
        expiresInSeconds: 600,
        emailDispatched,
        warning: dispatchError || undefined
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to generate verification OTP.' })
    }
  },

  /**
   * Verify 6-digit OTP and return DB user profile.
   * No master bypass codes. OTP must match exactly.
   */
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and verification code are required.' })
      }

      const trimmedEmail = email.trim().toLowerCase()
      const record = activeVerifications.get(trimmedEmail)

      if (!record) {
        return res.status(400).json({
          error: 'No active verification request found. Please request a new code.'
        })
      }

      if (Date.now() > record.expiresAt) {
        activeVerifications.delete(trimmedEmail)
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' })
      }

      if (record.otp !== otp.trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please check your inbox.' })
      }

      // Consume OTP (single-use)
      activeVerifications.delete(trimmedEmail)

      // Return real DB profile
      const dbUser = await lookupUserByEmail(trimmedEmail)
      if (!dbUser) {
        return res.status(404).json({ error: 'Account not found. Contact your administrator.' })
      }

      return res.json({
        success: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          department: dbUser.department,
          authProvider: 'coep-otp',
          authenticatedAt: new Date().toISOString()
        },
        message: 'Email verified successfully.'
      })
    } catch (err) {
      return res.status(500).json({ error: 'Verification failed.' })
    }
  },

  /**
   * Verify magic link token and return DB user profile.
   */
  async verifyLink(req, res) {
    try {
      const { token } = req.query
      if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' })
      }

      let matchedEmail = null
      for (const [registeredEmail, record] of activeVerifications.entries()) {
        if (record.token === token) {
          if (Date.now() > record.expiresAt) {
            activeVerifications.delete(registeredEmail)
            return res.status(400).json({ error: 'Verification link has expired.' })
          }
          matchedEmail = registeredEmail
          activeVerifications.delete(registeredEmail)
          break
        }
      }

      if (!matchedEmail) {
        return res.status(400).json({ error: 'Invalid or already used verification link.' })
      }

      const dbUser = await lookupUserByEmail(matchedEmail)
      if (!dbUser) {
        return res.status(404).json({ error: 'Account not found. Contact your administrator.' })
      }

      return res.json({
        success: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          department: dbUser.department,
          authProvider: 'coep-magic-link',
          authenticatedAt: new Date().toISOString()
        },
        message: 'Identity verified via magic link.'
      })
    } catch (err) {
      return res.status(500).json({ error: 'Failed to process verification link.' })
    }
  },

  /**
   * Microsoft Outlook SSO — syncs DB record after OAuth.
   * Role comes from DB, not the email or the OAuth token claims.
   */
  async outlookAuth(req, res) {
    try {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' })
      }

      const institutionalEmail = email.trim().toLowerCase()
      if (!isInstitutionalEmail(institutionalEmail)) {
        return res.status(400).json({
          error: 'Microsoft SSO is restricted to @coeptech.ac.in organizational accounts.'
        })
      }

      const dbUser = await lookupUserByEmail(institutionalEmail)
      if (!dbUser) {
        return res.status(404).json({
          error: 'No COEP Locus account linked to this Microsoft account. Contact your administrator.'
        })
      }

      return res.json({
        success: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          department: dbUser.department,
          authProvider: 'microsoft-outlook',
          authenticatedAt: new Date().toISOString()
        },
        message: 'Authenticated via Microsoft Outlook SSO.'
      })
    } catch (err) {
      return res.status(500).json({ error: 'Outlook authentication failed.' })
    }
  },

  /**
   * Password-based login.
   * Verifies password against the `password` column in the Supabase users table.
   * Passwords must be set by an administrator via the Supabase dashboard.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' })
      }

      const trimmedEmail = email.trim().toLowerCase()
      if (!isInstitutionalEmail(trimmedEmail)) {
        return res.status(400).json({ error: 'Please use your institutional email address.' })
      }

      if (!supabase) {
        return res.status(503).json({ error: 'Authentication service unavailable.' })
      }

      // Fetch user including password field
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('id, name, email, role, department, password, is_active')
        .eq('email', trimmedEmail)
        .maybeSingle()

      if (error || !dbUser) {
        return res.status(401).json({ error: 'Invalid email or password.' })
      }

      if (dbUser.is_active === false) {
        return res.status(403).json({ error: 'This account has been deactivated. Contact your administrator.' })
      }

      if (!dbUser.password) {
        return res.status(401).json({
          error: 'Password login is not configured for this account. Use Microsoft SSO or OTP instead.'
        })
      }

      // Verify password — supports both bcrypt hashes and plaintext (legacy)
      // If plaintext, auto-upgrade to bcrypt on successful login
      const isBcrypt = dbUser.password.startsWith('$2b$') || dbUser.password.startsWith('$2a$')
      let passwordMatch = false

      if (isBcrypt) {
        // Secure: compare against bcrypt hash
        passwordMatch = await bcrypt.compare(password, dbUser.password)
      } else {
        // Legacy plaintext — do constant-time comparison then upgrade to bcrypt
        const suppliedHash = crypto.createHash('sha256').update(password).digest('hex')
        const storedHash = crypto.createHash('sha256').update(dbUser.password).digest('hex')
        passwordMatch = crypto.timingSafeEqual(
          Buffer.from(suppliedHash, 'hex'),
          Buffer.from(storedHash, 'hex')
        )
        // Auto-upgrade: hash and store securely for next login
        if (passwordMatch) {
          const hashed = await bcrypt.hash(password, 12)
          await supabase.from('users').update({ password: hashed }).eq('email', trimmedEmail)
          console.log(`[Auth] Auto-upgraded password to bcrypt for ${trimmedEmail}`)
        }
      }

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' })
      }

      return res.json({
        success: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          department: dbUser.department,
          authProvider: 'password',
          authenticatedAt: new Date().toISOString()
        },
        message: 'Authentication successful.'
      })
    } catch (err) {
      console.error('[Auth Login Error]', err.message)
      return res.status(500).json({ error: 'Authentication failed.' })
    }
  },

  // ── Microsoft OAuth PKCE Token Exchange ──────────────────────────────────────
  // Frontend sends us the auth code + PKCE verifier.
  // We exchange it with Microsoft server-side (no CORS issues, no client secret needed).
  // We decode the id_token to get the email, look up role in Supabase, return profile.
  async tokenExchange(req, res) {
    try {
      const { code, codeVerifier, redirectUri } = req.body
      if (!code || !codeVerifier || !redirectUri) {
        return res.status(400).json({ error: 'Missing code, codeVerifier, or redirectUri' })
      }

      const clientId = process.env.VITE_AZURE_CLIENT_ID || 'b177caf5-6457-4162-b680-ea9eea7bf560'
      const tenantId = process.env.VITE_AZURE_TENANT_ID || 'b4c6b754-54e3-41e4-a8da-304355c62816'

      // Exchange auth code for tokens using PKCE (no client secret required)
      const tokenRes = await fetch(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
            scope: 'openid profile email User.Read'
          }).toString()
        }
      )

      const tokens = await tokenRes.json()
      if (tokens.error) {
        return res.status(400).json({ error: tokens.error_description || tokens.error })
      }

      // Decode id_token (JWT) to extract email — no verification needed for this claim
      let email = null
      if (tokens.id_token) {
        try {
          const payload = JSON.parse(
            Buffer.from(
              tokens.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
              'base64'
            ).toString('utf8')
          )
          email = payload.preferred_username || payload.email || payload.upn || null
        } catch (e) {
          console.warn('[TokenExchange] Failed to decode id_token:', e.message)
        }
      }

      // Fallback: call Microsoft Graph to get email from access_token
      if (!email && tokens.access_token) {
        try {
          const graphRes = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          })
          const graphData = await graphRes.json()
          email = graphData.mail || graphData.userPrincipalName || null
        } catch (e) {
          console.warn('[TokenExchange] Graph fallback failed:', e.message)
        }
      }

      if (!email) {
        return res.status(400).json({ error: 'Could not retrieve email from Microsoft tokens.' })
      }

      const lowerEmail = email.toLowerCase()

      // Look up real role from Supabase — DB is always the source of truth
      const dbUser = await lookupUserByEmail(lowerEmail)
      if (!dbUser || !dbUser.is_active) {
        return res.status(403).json({
          error: `No active COEP Locus account found for ${lowerEmail}. Contact your administrator.`
        })
      }

      return res.json({
        success: true,
        email: lowerEmail,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          department: dbUser.department,
          authProvider: 'microsoft-sso',
          authenticatedAt: new Date().toISOString()
        }
      })
    } catch (err) {
      console.error('[TokenExchange] Error:', err)
      return res.status(500).json({ error: 'Token exchange failed.' })
    }
  }
}

