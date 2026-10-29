import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import QRCode from 'qrcode'
import { config } from '../config/env.js'

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null

const smtpTransporter = (config.smtpUser && config.smtpPass)
  ? nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    })
  : null

/**
 * Generate a PNG Buffer and Base64 Data URL for a pass code
 */
export async function generateQrBuffer(passCode) {
  const code = passCode || 'COEP-GATE-PASS'
  const buffer = await QRCode.toBuffer(code, {
    width: 300,
    margin: 1.5,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  })
  const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`
  return { buffer, dataUrl, code }
}

/**
 * Universal email dispatcher (tries SMTP first, then Resend)
 */
async function dispatchEmail({ to, subject, html, attachments = [] }) {
  const recipient = (to || '').trim().toLowerCase()
  if (!recipient) {
    console.warn('[EmailService] No recipient email specified.')
    return { success: false, error: 'Recipient email required' }
  }

  let emailDispatched = false
  let errorMsg = null

  // 1. Try Nodemailer SMTP
  if (smtpTransporter) {
    try {
      const fromAddress = config.smtpFrom || `"COEP LOCUS" <${config.smtpUser}>`
      const info = await smtpTransporter.sendMail({
        from: fromAddress,
        to: recipient,
        subject,
        html,
        attachments
      })
      console.log(`[EmailService - SMTP] Dispatched to ${recipient} (Message ID: ${info.messageId})`)
      emailDispatched = true
      return { success: true, provider: 'smtp', messageId: info.messageId }
    } catch (err) {
      console.warn(`[EmailService - SMTP Error for ${recipient}]:`, err.message)
      errorMsg = err.message
    }
  }

  // 2. Try Resend API Fallback
  if (!emailDispatched && resend) {
    try {
      const resendAttachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.content ? att.content.toString('base64') : undefined
      }))

      const response = await resend.emails.send({
        from: config.resendFromEmail || 'COEP LOCUS <onboarding@resend.dev>',
        to: recipient,
        subject,
        html,
        attachments: resendAttachments.length ? resendAttachments : undefined
      })

      if (response?.error) {
        console.warn(`[EmailService - Resend Error for ${recipient}]:`, response.error.message || response.error)
        errorMsg = response.error.message
      } else {
        console.log(`[EmailService - Resend] Dispatched to ${recipient} (ID: ${response.data?.id})`)
        return { success: true, provider: 'resend', id: response.data?.id }
      }
    } catch (err) {
      console.warn(`[EmailService - Resend Exception for ${recipient}]:`, err.message)
      errorMsg = err.message
    }
  }

  return { success: emailDispatched, error: errorMsg }
}

/**
 * Send Digital Gate Pass Email with Legit Scannable QR Code
 */
export async function sendPassEmail({
  to,
  holderName = 'Campus Member',
  role = 'Student',
  passCode,
  venue = 'Campus Facility',
  purpose = 'Academic Session',
  date = new Date().toISOString().split('T')[0],
  timeSlot = 'Standard Slot',
  attendees = 1
}) {
  const code = passCode || `COEP-PASS-${Math.floor(1000 + Math.random() * 9000)}`
  const { buffer: qrBuffer, dataUrl: qrDataUrl } = await generateQrBuffer(code)

  const subject = `🎟️ Digital Gate Pass: ${code} - ${venue}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>COEP Digital Gate Pass</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; text-align: center;">
              <div style="color: #60a5fa; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                COEP TECHNOLOGICAL UNIVERSITY
              </div>
              <div style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 4px; letter-spacing: -0.3px;">
                LOCUS Smart Campus • Gate Pass
              </div>
              <div style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.8px;">
                Verified Entry Credential
              </div>
            </td>
          </tr>

          <!-- QR Code Focus Section -->
          <tr>
            <td style="padding: 28px 24px 16px 24px; text-align: center; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <div style="display: inline-block; padding: 16px; background-color: #ffffff; border-radius: 18px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
                <img src="${qrDataUrl}" alt="QR Pass ${code}" width="190" height="190" style="display: block; border-radius: 8px; margin: 0 auto;" />
                <div style="margin-top: 10px; font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✓ Scannable at Campus Checkpoints
                </div>
              </div>

              <!-- Pass Code Badge -->
              <div style="margin-top: 14px;">
                <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #1e3a8a; background-color: #dbeafe; padding: 6px 14px; border-radius: 8px; border: 1px solid #bfdbfe; letter-spacing: 0.5px;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>

          <!-- Reservation Details -->
          <tr>
            <td style="padding: 24px 28px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                Pass Holder & Space Details
              </div>

              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px;">
                <tr>
                  <td width="36%" style="color: #64748b; font-weight: 600;">Pass Holder:</td>
                  <td style="color: #0f172a; font-weight: 700;">${holderName} <span style="font-size: 11px; color: #64748b; font-weight: 500;">(${role})</span></td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Venue / Space:</td>
                  <td style="color: #0f172a; font-weight: 700;">${venue}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Date & Slot:</td>
                  <td style="color: #0f172a; font-weight: 700;">${date} • ${timeSlot}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Purpose:</td>
                  <td style="color: #334155;">${purpose}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Admitted Team:</td>
                  <td style="color: #0f172a; font-weight: 700;">${attendees} Person(s)</td>
                </tr>
              </table>

              <!-- Instructions -->
              <div style="margin-top: 20px; padding: 14px; background-color: #ecfdf5; border-radius: 10px; border: 1px solid #a7f3d0;">
                <div style="color: #065f46; font-size: 12px; font-weight: 700;">Security Checkpoint Instructions</div>
                <div style="color: #047857; font-size: 11px; margin-top: 3px; line-height: 1.5;">
                  Present this QR code directly from your phone screen to the security officer at <strong>Gate 1 (Main Entrance)</strong>, <strong>Gate 2 (Boat Club)</strong>, or the <strong>Library Turnstiles</strong> for instant clearance.
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              COEP Technological University • Central Security & Estate Management<br>
              Wellesley Road, Shivajinagar, Pune 411005 • This is an automated security transmission.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const attachments = [
    {
      filename: `COEP-Pass-${code}.png`,
      content: qrBuffer,
      contentType: 'image/png'
    }
  ]

  return await dispatchEmail({ to, subject, html, attachments })
}

/**
 * Send Booking Status Update Email (Confirmed, Pending, Cancelled, Rejected)
 */
export async function sendBookingUpdateEmail({
  to,
  recipientName = 'Campus Member',
  bookingRef,
  venue = 'Campus Facility',
  date = new Date().toISOString().split('T')[0],
  timeSlot = 'Standard Slot',
  status = 'Confirmed',
  purpose = 'Academic Reservation',
  decisionNotes = '',
  decidedBy = 'Administrator'
}) {
  const isApproved = status === 'Confirmed' || status === 'Approved'
  const isRejected = status === 'Rejected' || status === 'Cancelled'
  const isPending = status === 'Pending'

  const ref = bookingRef || `LOCUS-${Math.floor(100000 + Math.random() * 900000)}`

  let qrBuffer = null
  let qrDataUrl = null
  let attachments = []

  if (isApproved) {
    const qrRes = await generateQrBuffer(ref)
    qrBuffer = qrRes.buffer
    qrDataUrl = qrRes.dataUrl
    attachments.push({
      filename: `COEP-Pass-${ref}.png`,
      content: qrBuffer,
      contentType: 'image/png'
    })
  }

  const subject = isApproved
    ? `✅ Reservation Confirmed & Gate Pass: ${venue} (${date})`
    : isRejected
    ? `⚠️ Reservation Status Update: ${venue} (${status})`
    : `📋 Reservation Request Received: ${venue} (${date})`

  const statusColor = isApproved ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b'
  const statusBg = isApproved ? '#ecfdf5' : isRejected ? '#fef2f2' : '#fffbeb'
  const statusBorder = isApproved ? '#a7f3d0' : isRejected ? '#fecaca' : '#fde68a'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>COEP Reservation Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; text-align: center;">
              <div style="color: #60a5fa; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                COEP TECHNOLOGICAL UNIVERSITY
              </div>
              <div style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 4px; letter-spacing: -0.3px;">
                LOCUS Campus Reservation Update
              </div>
            </td>
          </tr>

          <!-- Status Highlight Banner -->
          <tr>
            <td style="padding: 20px 28px; background-color: ${statusBg}; border-bottom: 1px solid ${statusBorder}; text-align: center;">
              <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                Current Status
              </div>
              <div style="font-size: 18px; font-weight: 900; color: ${statusColor}; margin-top: 2px;">
                ${isApproved ? 'Booking Confirmed & Gate Pass Active' : isRejected ? `Booking ${status}` : 'Pending Administrative Review'}
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                Booking Reference: <strong style="font-family: monospace;">${ref}</strong>
              </div>
            </td>
          </tr>

          <!-- QR Section (if approved) -->
          ${
            isApproved && qrDataUrl
              ? `
          <tr>
            <td style="padding: 24px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
              <div style="display: inline-block; padding: 14px; background-color: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
                <img src="${qrDataUrl}" alt="Pass QR" width="160" height="160" style="display: block; margin: 0 auto; border-radius: 6px;" />
                <div style="margin-top: 8px; font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">
                  ✓ Gate Clearance QR Code
                </div>
              </div>
              <p style="font-size: 11px; color: #64748b; margin-top: 8px; margin-bottom: 0;">
                Pass Code: <strong style="font-family: monospace; color: #1e3a8a;">${ref}</strong>
              </p>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Details Table -->
          <tr>
            <td style="padding: 24px 28px;">
              <div style="font-size: 12px; color: #334155; margin-bottom: 14px;">
                Dear <strong>${recipientName}</strong>,<br>
                ${
                  isApproved
                    ? 'Your campus venue reservation has been reviewed and officially confirmed. Your digital gate pass has been generated.'
                    : isRejected
                    ? `Your reservation request has been updated to <strong>${status}</strong>.`
                    : 'Your campus venue reservation has been received and is queued for department review.'
                }
              </div>

              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px;">
                <tr>
                  <td width="35%" style="color: #64748b; font-weight: 600;">Venue:</td>
                  <td style="color: #0f172a; font-weight: 700;">${venue}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Date & Time:</td>
                  <td style="color: #0f172a; font-weight: 700;">${date} • ${timeSlot}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Declared Purpose:</td>
                  <td style="color: #334155;">${purpose}</td>
                </tr>
                ${
                  decisionNotes
                    ? `
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Reviewer Notes:</td>
                  <td style="color: #334155; font-style: italic;">"${decisionNotes}" (${decidedBy})</td>
                </tr>
                `
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              COEP Technological University • Central Estate & Space Allocation Secretariat<br>
              To inspect or manage your reservation, visit the LOCUS Campus Portal.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  return await dispatchEmail({ to, subject, html, attachments })
}
