import React, { useState, useRef, useEffect } from 'react'
import {
  QrCode,
  Scan,
  Camera,
  Search,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

// Verified Institutional Database
const KNOWN_PASS_DATABASE = {
  'COEP-LIB-8849-PASS': {
    passId: 'COEP-LIB-8849-PASS',
    bookingId: 'STU-BK-902',
    holderName: 'Aman Nirmal',
    role: 'Student',
    department: 'Computer Engineering',
    venue: 'Central Library Discussion Room B',
    purpose: 'Final Year Capstone Project Coding',
    date: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4,
    status: 'Valid'
  },
  'STU-BK-902': {
    passId: 'COEP-LIB-8849-PASS',
    bookingId: 'STU-BK-902',
    holderName: 'Aman Nirmal',
    role: 'Student',
    department: 'Computer Engineering',
    venue: 'Central Library Discussion Room B',
    purpose: 'Final Year Capstone Project Coding',
    date: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4,
    status: 'Valid'
  },
  'COEP-FAC-9912-KEY': {
    passId: 'COEP-FAC-9912-KEY',
    bookingId: 'FAC-BK-101',
    holderName: 'Dr. V. K. Kulkarni',
    role: 'Faculty',
    department: 'Computer Engineering',
    venue: 'ND01 (North Drawing Hall)',
    purpose: 'End-Semester Department Research & Capstone Viva',
    date: '2026-10-28',
    timeSlot: '09:00 AM - 11:00 AM',
    attendees: 120,
    status: 'Valid'
  },
  'COEP-CLB-7721-FEST': {
    passId: 'COEP-CLB-7721-FEST',
    bookingId: 'CLB-BK-401',
    holderName: 'MindSpark Secretarial Lead',
    role: 'Club Lead',
    department: 'Technical Events Secretariat',
    venue: 'BHAU Main Auditorium',
    purpose: 'MindSpark 2026: National Tech Symposium Keynote',
    date: '2026-10-28',
    timeSlot: '08:00 AM - 06:00 PM',
    attendees: 280,
    status: 'Valid'
  }
}

const INITIAL_LOGS = [
  {
    id: 'SCN-101',
    time: '13:40',
    passId: 'COEP-FAC-9912-KEY',
    name: 'Dr. V. K. Kulkarni',
    role: 'Faculty',
    venue: 'ND01',
    checkpoint: 'Gate 1',
    status: 'Admitted'
  },
  {
    id: 'SCN-102',
    time: '13:25',
    passId: 'COEP-LIB-8849-PASS',
    name: 'Aman Nirmal',
    role: 'Student',
    venue: 'Library Discussion Room B',
    checkpoint: 'Gate 1',
    status: 'Admitted'
  }
]

export default function SecurityPortal({ currentUser, onNavigateLogin }) {
  const [activeGate, setActiveGate] = useState('Gate 1 - Main Entrance')
  const [passCodeInput, setPassCodeInput] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef(null)

  // Camera toggle effect
  useEffect(() => {
    let stream = null

    if (cameraActive && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s
          if (videoRef.current) {
            videoRef.current.srcObject = s
          }
        })
        .catch(() => {
          // Camera permission denied or not available
          setCameraActive(false)
        })
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraActive])

  const handleVerify = (e) => {
    if (e) e.preventDefault()
    const code = passCodeInput.trim()
    if (!code) return

    const match = KNOWN_PASS_DATABASE[code]

    if (match) {
      setVerificationResult(match)
    } else {
      setVerificationResult({
        passId: code,
        holderName: 'Unknown or Invalid Pass',
        role: 'Unknown',
        department: 'N/A',
        venue: 'Unregistered',
        purpose: 'Pass code not found in central reservation directory',
        date: 'N/A',
        timeSlot: 'N/A',
        attendees: 0,
        status: 'Invalid'
      })
    }
  }

  const handleAdmit = (pass) => {
    const newEntry = {
      id: `SCN-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      passId: pass.passId,
      name: pass.holderName,
      role: pass.role,
      venue: pass.venue,
      checkpoint: activeGate.split(' - ')[0],
      status: 'Admitted'
    }

    setLogs([newEntry, ...logs])
    setVerificationResult(null)
    setPassCodeInput('')
  }

  const handleDeny = (pass) => {
    const newEntry = {
      id: `SCN-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      passId: pass.passId,
      name: pass.holderName,
      role: pass.role,
      venue: pass.venue,
      checkpoint: activeGate.split(' - ')[0],
      status: 'Denied'
    }

    setLogs([newEntry, ...logs])
    setVerificationResult(null)
    setPassCodeInput('')
  }

  return (
    <ProtectedGate
      allowedRoles={['Security Guard', 'Administrator']}
      portalName="Gate Scanner"
      portalDescription="Verify visitor and student entry passes at campus security checkpoints."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
    >
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Gate Scanner
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Scan QR passes or enter pass codes to verify student entry.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Post:</span>
              <select
                value={activeGate}
                onChange={(e) => setActiveGate(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Gate 1 - Main Entrance">Gate 1 - Main Entrance</option>
                <option value="Gate 2 - Wellesley Boat Club">Gate 2 - Wellesley Boat Club</option>
                <option value="Library Turnstile">Library Turnstile</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Main Scanner & Verification Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Input & Camera */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pass Verification</h2>
                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    cameraActive
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{cameraActive ? 'Turn Off Camera' : 'Enable Camera'}</span>
                </button>
              </div>

              {/* Camera Stream Viewport */}
              {cameraActive ? (
                <div className="relative aspect-4/3 w-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-lg pointer-events-none" />
                </div>
              ) : (
                <div className="aspect-16/9 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4 text-center">
                  <Scan className="w-8 h-8 mb-2 text-slate-400 dark:text-slate-500" />
                  <p className="text-xs">Scan using device camera or enter Pass ID manually below.</p>
                </div>
              )}

              {/* Manual Pass ID Input */}
              <form onSubmit={handleVerify} className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Pass Code / Booking ID
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={passCodeInput}
                      onChange={(e) => setPassCodeInput(e.target.value)}
                      placeholder="e.g. COEP-LIB-8849-PASS"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Verification Result */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 min-h-[320px] flex flex-col justify-center shadow-2xs">
              {verificationResult ? (
                <div className="space-y-4">
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      verificationResult.status === 'Valid'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {verificationResult.status === 'Valid' ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-black uppercase">
                          {verificationResult.status === 'Valid' ? 'Valid Pass - Access Permitted' : 'Access Denied'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono">{verificationResult.passId}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase">Pass Holder</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{verificationResult.holderName}</strong>
                      <span className="text-slate-500 dark:text-slate-400 block">{verificationResult.role} • {verificationResult.department}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Venue</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{verificationResult.venue}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Slot</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{verificationResult.date} ({verificationResult.timeSlot})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    {verificationResult.status === 'Valid' ? (
                      <button
                        type="button"
                        onClick={() => handleAdmit(verificationResult)}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        Grant Entry & Log Check-In
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeny(verificationResult)}
                        className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        Log Denied Entry
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setVerificationResult(null)}
                      className="px-4 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <QrCode className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium">Awaiting pass scan or manual code verification.</p>
                </div>
              )}
            </div>
          </div>

          {/* Gate Access Log */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Today's Checkpoint Entries ({logs.length})</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live verified visitor entries at {activeGate}.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Pass Code</th>
                    <th className="py-3 px-4">Holder</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Gate</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{log.time}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{log.passId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.role}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{log.venue}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{log.checkpoint}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'Admitted'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 dark:text-slate-500">
                        No entries recorded today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedGate>
  )
}
