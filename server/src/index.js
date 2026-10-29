import express from 'express'
import cors from 'cors'
import path from 'path'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import venueRoutes from './routes/venueRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import userRoutes from './routes/userRoutes.js'
import roleRequestRoutes from './routes/roleRequestRoutes.js'
import timetableRoutes from './routes/timetableRoutes.js'
import logRoutes from './routes/logRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { supabase } from './config/supabase.js'
import { corsOriginValidator } from './middleware/auth.js'

const app = express()

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
// Sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, etc.
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow Cashfree JS SDK & React inline scripts
  crossOriginEmbedderPolicy: false
}))

// ─── CORS — Restrict to Known Origins ────────────────────────────────────────
app.use(cors({
  origin: corsOriginValidator,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}))

// ─── Body Size Limit ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '512kb' }))

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Auth endpoints: 20 attempts per 15 min window (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false
})

// OTP specifically: 5 sends per 10 min (prevents email spam)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

// General API: 200 requests per minute
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api/', generalLimiter)

// ─── Static Photos Serving ────────────────────────────────────────────────────
app.use('/photos', express.static(path.resolve(process.cwd(), 'public/photos')))
app.use('/photos', express.static(path.resolve(process.cwd(), 'photos')))

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// ─── Healthcheck Route ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'healthy',
    service: 'LOCUS Central Estate & Campus API Service',
    university: 'COEP Technological University',
    database: supabase ? 'Supabase PostgreSQL (Connected)' : 'Local Resilient Store Mode',
    modules: ['auth', 'venues', 'bookings', 'users', 'role-requests', 'timetable', 'logs', 'events'],
    timestamp: new Date().toISOString()
  })
})

// ─── Application Routes ───────────────────────────────────────────────────────
// Auth routes — rate limited
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/auth/send-otp', otpLimiter)  // extra limit on OTP
app.use('/api/venues', venueRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/role-requests', roleRequestRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/payments', paymentRoutes)

// ─── Serve Static Client Assets ───────────────────────────────────────────────
const distPath = path.resolve(process.cwd(), 'dist')
app.use(express.static(distPath))

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.method !== 'GET') return next()
  if (req.path.startsWith('/api') || req.path.startsWith('/photos')) return next()
  const indexHtml = path.join(distPath, 'index.html')
  res.sendFile(indexHtml, (err) => { if (err) next() })
})

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found.' })
})

// ─── Central Error Handler ────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production'
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err)
  // Never leak stack traces or internal messages in production
  return res.status(err.status || 500).json({
    error: isProd ? 'An unexpected error occurred.' : (err.message || 'Internal server error.')
  })
})

const PORT = config.port

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[LOCUS API] Server listening on port ${PORT} (http://localhost:${PORT})`)
    console.log(`[LOCUS API] Health check endpoint: http://localhost:${PORT}/api/health`)
    console.log(`[LOCUS API] Security: Helmet ✓ | CORS restricted ✓ | Rate limiting ✓`)
  })
}

export default app
