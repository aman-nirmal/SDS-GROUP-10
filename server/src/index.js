import express from 'express'
import cors from 'cors'
import path from 'path'
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

const app = express()

// Static Photos Serving
app.use('/photos', express.static(path.resolve(process.cwd(), 'public/photos')))
app.use('/photos', express.static(path.resolve(process.cwd(), 'photos')))

// Global Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// Request Logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// Healthcheck Route
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'healthy',
    service: 'LOCUS Central Estate & Campus API Service',
    university: 'COEP Technological University',
    database: supabase ? 'Supabase PostgreSQL (Connected)' : 'Local Resilient Store Mode',
    modules: [
      'auth',
      'venues',
      'bookings',
      'users',
      'role-requests',
      'timetable',
      'logs',
      'events'
    ],
    timestamp: new Date().toISOString()
  })
})

// Mount Application Routes
app.use('/api/auth', authRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/role-requests', roleRequestRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/payments', paymentRoutes)

// Serve static client assets from /dist if present
const distPath = path.resolve(process.cwd(), 'dist')
app.use(express.static(distPath))

// SPA Fallback for client web routes
app.use((req, res, next) => {
  if (req.method !== 'GET') return next()
  if (req.path.startsWith('/api') || req.path.startsWith('/photos')) {
    return next()
  }
  const indexHtml = path.join(distPath, 'index.html')
  res.sendFile(indexHtml, (err) => {
    if (err) next()
  })
})

// 404 Route Handler for unmatched API routes
app.use((req, res) => {
  return res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  })
})

// Central Error Handler
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err)
  return res.status(500).json({
    error: 'Internal server error.',
    message: err.message
  })
})

const PORT = config.port

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[LOCUS API] Server listening on port ${PORT} (http://localhost:${PORT})`)
    console.log(`[LOCUS API] Health check endpoint: http://localhost:${PORT}/api/health`)
  })
}

export default app
