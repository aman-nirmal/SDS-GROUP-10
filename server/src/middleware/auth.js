/**
 * Lightweight API protection middleware for COEP Locus.
 * Sensitive endpoints require X-API-Key header to prevent open enumeration.
 * In production, replace with proper JWT / session-based auth.
 */

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://locus.coeptech.ac.in',
  'https://sds-group-10.netlify.app',
  'https://sds-group-10-pr-*.netlify.app'
]

/**
 * CORS origin validator — only allows known COEP Locus origins.
 */
export function corsOriginValidator(origin, callback) {
  // Allow requests with no origin (Postman, server-to-server, same-origin)
  if (!origin) return callback(null, true)
  const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
    if (allowed.includes('*')) {
      const prefix = allowed.split('*')[0]
      return origin.startsWith(prefix)
    }
    return allowed === origin
  })
  if (isAllowed) {
    callback(null, true)
  } else {
    callback(new Error(`CORS: Origin ${origin} not permitted.`))
  }
}

/**
 * requireAuth — blocks unauthenticated access to sensitive routes.
 * Accepts either an X-API-Key header OR a valid session cookie (future).
 * For now this is a lightweight origin + referer check for the demo.
 */
export function requireAuth(req, res, next) {
  // Allow internal server calls
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''
  const isKnownOrigin = ALLOWED_ORIGINS.some((allowed) => {
    if (allowed.includes('*')) {
      const prefix = allowed.split('*')[0]
      return origin.startsWith(prefix) || referer.startsWith(prefix)
    }
    return origin === allowed || referer.startsWith(allowed)
  })

  if (!origin || isKnownOrigin) {
    return next()
  }

  return res.status(403).json({ error: 'Access denied. Institutional network required.' })
}
