import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Download, Copy, Check, ShieldCheck, Mail, Loader2 } from 'lucide-react'
import { bookingsApi } from '../lib/api'

export default function DigitalPassQR({
  passCode,
  passData = {},
  userEmail = '',
  size = 200,
  showActions = true,
  className = ''
}) {
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [isEmailing, setIsEmailing] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null) // null | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('')

  const code = passCode || passData.digitalPassCode || passData.passId || passData.id || 'COEP-PASS'
  const targetEmail = userEmail || passData.applicantEmail || passData.email || 'student@coeptech.ac.in'

  useEffect(() => {
    if (!code) return
    // Encode the verification payload (raw code works with all scanners)
    QRCode.toDataURL(code, {
      width: size * 2, // High resolution for Retina & crisp scanning
      margin: 1.5,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error('Error generating QR code:', err))
  }, [code, size])

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownload = () => {
    if (!qrUrl) return
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `COEP_Pass_${code}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSendEmail = async () => {
    let emailToSend = targetEmail
    if (!emailToSend || emailToSend === 'student@coeptech.ac.in') {
      const prompted = window.prompt('Enter your email to receive this pass & QR code:', targetEmail)
      if (!prompted || !prompted.trim()) return
      emailToSend = prompted.trim()
    }

    setIsEmailing(true)
    setEmailStatus(null)

    try {
      const res = await bookingsApi.sendPassEmail({
        email: emailToSend,
        passCode: code,
        venue: passData.venue || passData.venueName || 'Campus Facility',
        purpose: passData.purpose || 'Campus Access',
        date: passData.date || new Date().toISOString().split('T')[0],
        timeSlot: passData.timeSlot || 'Active Window',
        attendees: passData.attendees || 1,
        holderName: passData.holderName || passData.applicantName || 'Student Member',
        role: passData.role || passData.applicantRole || 'Student'
      })

      if (res && res.success) {
        setEmailStatus('success')
        setStatusMessage(`Pass sent to ${emailToSend}`)
        setTimeout(() => setEmailStatus(null), 4000)
      } else {
        setEmailStatus('error')
        setStatusMessage(res?.error || 'Failed to dispatch email')
        setTimeout(() => setEmailStatus(null), 4000)
      }
    } catch (err) {
      setEmailStatus('error')
      setStatusMessage(err.message || 'Network error sending pass')
      setTimeout(() => setEmailStatus(null), 4000)
    } finally {
      setIsEmailing(false)
    }
  }

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* White backing container for the QR code so it scans easily in dark mode */}
      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-block relative group">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`QR Pass for ${code}`}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="rounded-lg object-contain block select-none"
          />
        ) : (
          <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="flex items-center justify-center bg-slate-100 rounded-lg text-xs text-slate-400 font-mono"
          >
            Generating QR...
          </div>
        )}

        {/* Small verified security badge at center bottom */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-white whitespace-nowrap">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>COEP Verified</span>
        </div>
      </div>

      {/* Pass Code string */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <code className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
          {code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Copy Pass Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Action buttons: Download & Email Pass */}
      {showActions && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>Save QR Image</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isEmailing}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isEmailing ? (
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
            ) : (
              <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            )}
            <span>{isEmailing ? 'Dispatching...' : 'Email Me Pass'}</span>
          </button>
        </div>
      )}

      {/* Status feedback message */}
      {emailStatus && (
        <div
          className={`mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
            emailStatus === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          {emailStatus === 'success' ? `✓ ${statusMessage}` : `✕ ${statusMessage}`}
        </div>
      )}
    </div>
  )
}
