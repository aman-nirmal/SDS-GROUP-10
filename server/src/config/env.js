import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.local first if present, otherwise .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

export const config = {
  port: process.env.PORT || 5001,
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  nodeEnv: process.env.NODE_ENV || 'development'
}
