import express from 'express'
import cors from 'cors'
import { config } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import { supabase } from './config/supabase.js'

const app = express()

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
    service: 'LOCUS Authentication API Service',
    university: 'COEP Technological University',
    database: supabase ? 'Supabase PostgreSQL (Connected)' : 'Local Auth Fallback Mode',
    timestamp: new Date().toISOString()
  })
})

// Mount Authentication Module
app.use('/api/auth', authRoutes)

// 404 Route Handler
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
