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
  nodeEnv: process.env.NODE_ENV || 'development',
  cashfreeAppId: process.env.CASHFREE_APP_ID || '14863398d8e4ab22ef2699a30de9336841',
  cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_prod_4cc07ee54e6f3a6a3c44661fe41fb73f_f3d9c0bc',
  cashfreeApiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
  cashfreeEnv: process.env.CASHFREE_ENV || 'production'
}
