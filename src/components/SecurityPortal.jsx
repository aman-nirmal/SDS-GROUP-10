import React, { useState } from 'react'
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scan,
  Camera,
  Search,
  User,
  Calendar,
  Clock,
  MapPin,
  Building,
  Radio,
  FileCheck,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import ProtectedGate from './ProtectedGate'

// Known issued pass registry for verification lookup
const KNOWN_PASS_DATABASE = {
  'COEP-LIB-8849-PASS': {
    passId: 'COEP-LIB-8849-PASS',
    bookingId: 'STU-BK-902',
    holderName: 'Aman Nirmal',
    role: 'Student',
    department: 'Computer Engineering (B.Tech Year 4)',
    rollNo: '112103044',
    venue: 'Central Library Discussion Room B',
    purpose: 'Final Year Capstone Project: Distributed Systems Coding',
    date: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4,
    status: 'Valid',
    specialClearance: 'High-Speed Eduroam & Library Workstation Authorized',
    issuedBy: 'Central Library System'
  },
  'STU-BK-902': {
    passId: 'COEP-LIB-8849-PASS',
    bookingId: 'STU-BK-902',
    holderName: 'Aman Nirmal',
    role: 'Student',
    department: 'Computer Engineering (B.Tech Year 4)',
    rollNo: '112103044',
    venue: 'Central Library Discussion Room B',
    purpose: 'Final Year Capstone Project: Distributed Systems Coding',
    date: '2026-10-24',
    timeSlot: '02:00 PM - 04:00 PM',
    attendees: 4,
    status: 'Valid',
    specialClearance: 'High-Speed Eduroam & Library Workstation Authorized',
    issuedBy: 'Central Library System'
  },
  'COEP-FAC-9912-KEY': {
    passId: 'COEP-FAC-9912-KEY',
    bookingId: 'FAC-BK-101',
    holderName: 'Dr. V. K. Kulkarni',
    role: 'Faculty',
    department: 'Computer Engineering & IT',
    rollNo: 'FAC-EMP-0042',
    venue: 'AC 101 Smart Lecture Hall',
    purpose: 'CS 402: Advanced Distributed Operating Systems - Lecture 14',
    date: '2026-10-24',
    timeSlot: '10:00 AM - 12:00 PM',
    attendees: 75,
    status: 'Valid',
    specialClearance: 'Faculty Smart Podium Key & AV Overhead Projector Access',
    issuedBy: 'Academic Deans Office'
  },
  'COEP-CLB-7721-FEST': {
    passId: 'COEP-CLB-7721-FEST',
    bookingId: 'CLB-BK-401',
    holderName: 'Sahil Deshmukh (Secretary)',
    role: 'Club Lead',
    department: 'MindSpark Technical Fest Secretariat',
    rollNo: 'MS-SEC-2026',
    venue: 'BHAU Main Auditorium & Foyer',
    purpose: 'MindSpark 2026: National Tech Symposium Inaugural Keynote',
    date: '2026-10-28',
    timeSlot: '08:00 AM - 06:00 PM',
    attendees: 280,
    status: 'Pending Logistics',
    specialClearance: 'Heavy Equipment Delivery & Stage PA System Approved',
    issuedBy: 'Gymkhana Staff Advisor'
  },
  'COEP-GST-5510-TOUR': {
    passId: 'COEP-GST-5510-TOUR',
    bookingId: 'GST-BK-330',
    holderName: 'Mr. Rajesh & Neha Verma',
    role: 'Guest / Prospective Student',
    department: 'External Visitor Delegation',
    rollNo: 'GST-VIS-0881',
    venue: 'Historic Main Victorian Heritage Building Quadrangle',
    purpose: 'Campus Architecture Tour & Admissions Advisory',
    date: '2026-10-24',
    timeSlot: '11:00 AM - 01:00 PM',
    attendees: 2,
    status: 'Valid',
    specialClearance: 'Visitor ID Badges Required at Gate 1 Checkpoint',
    issuedBy: 'Public Relations & Estate Secretariat'
  },
  'COEP-REVOKED-9999': {
    passId: 'COEP-REVOKED-9999',
    bookingId: 'REV-BK-000',
    holderName: 'Suspended Account Pass',
    role: 'Student',
    department: 'Mechanical Engineering',
    rollNo: '112204012',
    venue: 'Advanced Robotics Lab',
    purpose: 'Unauthorized After-Hours Lab Access',
    date: '2026-10-20',
    timeSlot: '08:00 PM - 11:00 PM',
    attendees: 1,
    status: 'Revoked',
    specialClearance: 'Access Revoked by Chief Proctor - Impound Pass',
    issuedBy: 'Chief Proctor Office'
  }
}

const INITIAL_RECENT_SCANS = [
  {
    id: 'SCN-1082',
    time: '13:42:09',
    passId: 'COEP-FAC-9912-KEY',
    name: 'Dr. V. K. Kulkarni',
    role: 'Faculty',
    venue: 'AC 101 Smart Lecture Hall',
    checkpoint: 'Gate 1 - Main Arch',
    verdict: 'Admitted',
    guardNotes: 'Staff biometric matched'
  },
  {
    id: 'SCN-1081',
    time: '13:35:44',
    passId: 'COEP-GST-5510-TOUR',
    name: 'Mr. Rajesh & Neha Verma',
    role: 'Guest',
    venue: 'Historic Main Building',
    checkpoint: 'Gate 1 - Main Arch',
    verdict: 'Admitted',
    guardNotes: 'Visitor passes issued'
  },
  {
    id: 'SCN-1080',
    time: '13:18:20',
    passId: 'COEP-REVOKED-9999',
    name: 'Suspended Account Pass',
    role: 'Student',
    venue: 'Advanced Robotics Lab',
    checkpoint: 'Gate 2 - Wellesley Boat Club',
    verdict: 'Denied',
    guardNotes: 'Blacklisted hash - Proctor notified'
  }
]

export default function SecurityPortal({ currentUser, onNavigateLogin, onQuickLogin }) {
  const [activeGate, setActiveGate] = useState('Gate 1 - Main Heritage Gate')
  const [searchInput, setSearchInput] = useState('')
  const [activeScanResult, setActiveScanResult] = useState(null)
  const [scanMessage, setScanMessage] = useState(null)
  const [recentScans, setRecentScans] = useState(INITIAL_RECENT_SCANS)
  const [isScannerActive, setIsScannerActive] = useState(true)
  const [filterQuery, setFilterQuery] = useState('')
  const [currentDateStr] = useState('Friday, Oct 24, 2026')

  // Handle pass verification lookup
  const handleVerifyPass = (code) => {
    const cleanCode = (code || searchInput).trim()
    if (!cleanCode) return

    const match = KNOWN_PASS_DATABASE[cleanCode]

    if (match) {
      setActiveScanResult(match)
      setScanMessage({
        type: match.status === 'Valid' ? 'success' : match.status === 'Revoked' ? 'error' : 'warning',
        text:
          match.status === 'Valid'
            ? 'Pass Authenticated: Valid active institutional credential.'
            : match.status === 'Revoked'
            ? 'ALERT: This pass has been REVOKED by campus administration. Do not permit entry.'
            : 'ATTENTION: Pass requires additional supervisory clearance before entry.'
      })
    } else {
      setActiveScanResult({
        passId: cleanCode,
        bookingId: 'UNKNOWN',
        holderName: 'Unrecognized Pass QR / Hash',
        role: 'Unknown',
        department: 'Not Registered in COEP Active Directory',
        venue: 'Unassigned',
        purpose: 'QR code hash does not match any current institutional booking reservation',
        date: 'N/A',
        timeSlot: 'N/A',
        attendees: 0,
        status: 'Invalid',
        specialClearance: 'No clearance. Deny entry and verify physical identity card.',
        issuedBy: 'Unknown'
      })
      setScanMessage({
        type: 'error',
        text: 'INVALID QR: Code not found in LOCUS Central Estate database.'
      })
    }
  }

  // Grant entry & log to stream
  const handleGrantEntry = (pass) => {
    const newLog = {
      id: `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      passId: pass.passId,
      name: pass.holderName,
      role: pass.role,
      venue: pass.venue,
      checkpoint: activeGate,
      verdict: 'Admitted',
      guardNotes: `Entry granted by ${currentUser?.name || 'Officer R. S. Patil'}`
    }

    setRecentScans([newLog, ...recentScans])
    setScanMessage({
      type: 'success',
      text: `Entry Confirmed: ${pass.holderName} logged at ${activeGate}.`
    })
    setActiveScanResult(null)
    setSearchInput('')
  }

  // Deny entry & log
  const handleDenyEntry = (pass) => {
    const newLog = {
      id: `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      passId: pass.passId,
      name: pass.holderName,
      role: pass.role,
      venue: pass.venue,
      checkpoint: activeGate,
      verdict: 'Denied',
      guardNotes: `Entry denied by ${currentUser?.name || 'Officer R. S. Patil'}: ${pass.status}`
    }

    setRecentScans([newLog, ...recentScans])
    setScanMessage({
      type: 'error',
      text: `Access Denied: Incident logged for pass ${pass.passId}.`
    })
    setActiveScanResult(null)
    setSearchInput('')
  }

  const filteredLogs = recentScans.filter(
    (log) =>
      log.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.passId.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.venue.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <ProtectedGate
      allowedRoles={['Security Guard', 'Administrator']}
      portalName="Campus Security & QR Gate Clearance Console"
      portalDescription="Restricted to verified COEP Security Force personnel and Central Estate administrators for checkpoint access control."
      currentUser={currentUser}
      onNavigateLogin={onNavigateLogin}
      onQuickLogin={onQuickLogin}
    >
      <div className="w-full min-h-screen bg-slate-100 text-slate-900 pb-20">
        {/* Top Duty Header */}
        <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    LOCUS Security OS v2.4
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Checkpoint Live
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-extrabold text-white">
                  Gate Security & QR Pass Verification
                </h1>
              </div>
            </div>

            {/* Checkpoint Location Switcher */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400 font-semibold">Post:</span>
                <select
                  value={activeGate}
                  onChange={(e) => setActiveGate(e.target.value)}
                  className="bg-transparent text-white font-bold outline-none cursor-pointer"
                >
                  <option value="Gate 1 - Main Heritage Gate" className="bg-slate-900">
                    Gate 1 - Main Victorian Arch
                  </option>
                  <option value="Gate 2 - Boat Club / Wellesley" className="bg-slate-900">
                    Gate 2 - Wellesley Boat Club
                  </option>
                  <option value="Library Turnstile Checkpoint" className="bg-slate-900">
                    Library Turnstile & Discussion Booths
                  </option>
                  <option value="AC-101 Academic Complex Gate" className="bg-slate-900">
                    AC-101 Academic Complex Wing
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-400">Officer:</span>
                <span className="font-bold text-white">{currentUser?.name || 'Officer R. S. Patil'}</span>
                <span className="text-[10px] font-mono text-emerald-400">ID: SEC-042</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Broadcast Ticker */}
        <div className="bg-emerald-900/40 border-b border-emerald-800/60 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>
                <strong>Campus Checkpoints Normal:</strong> All automated turnstiles online. High-priority clearance required for Boat Club Regatta preparation.
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-300 hidden sm:inline">
              Today: {currentDateStr}
            </span>
          </div>
        </div>

        {/* Main Grid: Scanner HUD & Pass Details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Passes Scanned Today</div>
              <div className="text-2xl font-black text-slate-900 mt-1">128</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">+14% vs yesterday</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admitted On-Campus</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">124</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Active inside perimeter</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access Denied / Flagged</div>
              <div className="text-2xl font-black text-rose-600 mt-1">4</div>
              <div className="text-[11px] text-rose-500 font-medium mt-0.5">Security incidents logged</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duty Gate</div>
              <div className="text-sm font-black text-indigo-700 truncate mt-1.5">{activeGate}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Shift: 08:00 - 16:00</div>
            </div>
          </div>

          {/* Feedback Alert if any */}
          {scanMessage && (
            <div
              className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : scanMessage.type === 'warning'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {scanMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                {scanMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                {scanMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                <span>{scanMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setScanMessage(null)}
                className="text-xs px-2 py-1 rounded-lg hover:bg-black/5 font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Two Column Layout: Scanner Viewport + Verified Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: QR Scanner Viewport & Manual Input */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-6 text-white space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scan className="w-5 h-5 text-emerald-400" />
                    <h2 className="font-extrabold text-white text-base">Optical QR Scanner</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScannerActive(!isScannerActive)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isScannerActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isScannerActive ? 'Scanner Armed' : 'Scanner Paused'}</span>
                  </button>
                </div>

                {/* Viewfinder simulation box */}
                <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                  {/* Targeting corner reticles */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

                  {/* Animated laser scan line */}
                  {isScannerActive && (
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
                  )}

                  <QrCode className={`w-20 h-20 transition-all duration-300 ${isScannerActive ? 'text-emerald-400/80' : 'text-slate-600'}`} />

                  <p className="mt-4 text-xs font-semibold text-slate-400 max-w-xs">
                    {isScannerActive
                      ? 'Point security tablet camera at visitor pass QR code or choose a test slip below'
                      : 'Camera scanner is currently standby'}
                  </p>
                </div>

                {/* Manual Pass ID / Code Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleVerifyPass()
                  }}
                  className="space-y-2"
                >
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Manual Booking ID or QR Hash Input
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="e.g. COEP-LIB-8849-PASS, STU-BK-902..."
                        className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Scan className="w-4 h-4" />
                      <span>Verify</span>
                    </button>
                  </div>
                </form>

                {/* Simulated Quick Scan Triggers */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    1-Click Scanner Presets for Field Verification:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleVerifyPass('COEP-LIB-8849-PASS')}
                      className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Aman Nirmal (Student)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">Valid</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">COEP-LIB-8849-PASS</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyPass('COEP-FAC-9912-KEY')}
                      className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Dr. V. K. Kulkarni (Faculty)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">Valid</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">COEP-FAC-9912-KEY</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyPass('COEP-CLB-7721-FEST')}
                      className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Sahil (MindSpark Fest)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300">Pending</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">COEP-CLB-7721-FEST</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyPass('COEP-REVOKED-9999')}
                      className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Revoked Pass Sample</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300">Revoked</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">COEP-REVOKED-9999</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Verification Result HUD Card */}
            <div className="lg:col-span-6 space-y-4">
              {activeScanResult ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-5 animate-in fade-in duration-200">
                  {/* Status Headline Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      activeScanResult.status === 'Valid'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : activeScanResult.status === 'Revoked'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {activeScanResult.status === 'Valid' && <ShieldCheck className="w-8 h-8 text-emerald-600" />}
                      {activeScanResult.status === 'Revoked' && <ShieldAlert className="w-8 h-8 text-rose-600" />}
                      {activeScanResult.status !== 'Valid' && activeScanResult.status !== 'Revoked' && (
                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                      )}
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider">
                          Verification Verdict
                        </div>
                        <div className="text-lg font-black">
                          {activeScanResult.status === 'Valid'
                            ? 'ENTRY PERMITTED - VALID PASS'
                            : activeScanResult.status === 'Revoked'
                            ? 'SECURITY ALERT - ACCESS DENIED'
                            : 'RESTRICTED / PENDING AUTHORIZATION'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        activeScanResult.status === 'Valid'
                          ? 'bg-emerald-600 text-white'
                          : activeScanResult.status === 'Revoked'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {activeScanResult.status}
                    </span>
                  </div>

                  {/* Pass Holder Details */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Pass Holder / Applicant
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {activeScanResult.holderName}
                        </h3>
                        <p className="text-xs text-slate-600">{activeScanResult.department}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold">
                        {activeScanResult.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs font-medium">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll / Staff ID</span>
                        <span className="font-mono font-bold text-slate-800">{activeScanResult.rollNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Pass Hash</span>
                        <span className="font-mono font-bold text-indigo-700 truncate block">
                          {activeScanResult.passId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Venue & Time slot Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Destination Venue: <strong className="text-slate-900">{activeScanResult.venue}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Authorized Date: <strong>{activeScanResult.date}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Approved Slot: <strong>{activeScanResult.timeSlot}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Clearance: <span className="text-indigo-700 font-semibold">{activeScanResult.specialClearance}</span></span>
                    </div>
                  </div>

                  {/* Guard Action Buttons */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                    {activeScanResult.status === 'Valid' ? (
                      <button
                        type="button"
                        onClick={() => handleGrantEntry(activeScanResult)}
                        className="w-full sm:flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Admit & Log Check-In</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDenyEntry(activeScanResult)}
                        className="w-full sm:flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Log Denial & Alert Proctor</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveScanResult(null)}
                      className="w-full sm:w-auto px-5 h-12 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Clear Screen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-8 text-center flex flex-col items-center justify-center min-h-[420px] text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Awaiting QR Code Scan</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    When a visitor, student, or faculty member presents their digital pass, scan the QR code with the terminal or type their pass identifier.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Checkpoint Entry Audit Log */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Live Gate Access & Verification Stream
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological record of visitor and student passes validated at {activeGate}.
                </p>
              </div>

              {/* Log Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter logs by name or pass ID..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Pass ID</th>
                    <th className="py-3 px-4">Holder Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Destination Venue</th>
                    <th className="py-3 px-4">Checkpoint</th>
                    <th className="py-3 px-4">Verdict</th>
                    <th className="py-3 px-4">Guard Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{log.time}</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">{log.passId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{log.venue}</td>
                      <td className="py-3 px-4 text-slate-500">{log.checkpoint}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.verdict === 'Admitted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {log.verdict}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic">{log.guardNotes}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No entry logs match the search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </ProtectedGate>
  )
}
