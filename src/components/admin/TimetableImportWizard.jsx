import React, { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Download,
  Trash2,
  FileCheck,
  Building,
  Check,
  Layers
} from 'lucide-react'
import { parseTimeToMinutes, parseTimeSlot } from './VenueBlockModal'

const REQUIRED_FIELDS = [
  { key: 'faculty', label: 'Faculty Name', required: true, aliases: ['faculty', 'instructor', 'teacher', 'prof', 'professor', 'faculty name'] },
  { key: 'department', label: 'Department', required: true, aliases: ['department', 'dept', 'branch', 'discipline'] },
  { key: 'course', label: 'Course Name', required: true, aliases: ['course', 'subject', 'course name', 'paper', 'title'] },
  { key: 'venue', label: 'Venue', required: true, aliases: ['venue', 'room', 'classroom', 'hall', 'lab', 'location', 'space'] },
  { key: 'date', label: 'Date or Day of Week', required: true, aliases: ['date', 'day', 'day of week', 'day_of_week', 'schedule date'] },
  { key: 'startTime', label: 'Start Time', required: true, aliases: ['start', 'start time', 'from', 'start_time'] },
  { key: 'endTime', label: 'End Time', required: true, aliases: ['end', 'end time', 'to', 'end_time'] },
  { key: 'batch', label: 'Batch / Section', required: false, aliases: ['batch', 'section', 'division', 'div', 'class'] },
  { key: 'semester', label: 'Semester / Academic Year', required: false, aliases: ['sem', 'semester', 'academic year', 'year', 'ay'] }
]

export default function TimetableImportWizard({
  isOpen,
  onClose,
  onImportComplete,
  venues = [],
  existingTimetable = [],
  existingBookings = []
}) {
  // Wizard Step: 1 | 2 | 3 | 4 | 5
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Upload state
  const [file, setFile] = useState(null)
  const [workbook, setWorkbook] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Step 2: Worksheet and mapping state
  const [selectedSheet, setSelectedSheet] = useState('')
  const [rawHeaders, setRawHeaders] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [columnMappings, setColumnMappings] = useState({}) // { fieldKey: headerName }
  const [mappingError, setMappingError] = useState('')

  // Step 3: Parsed preview records
  const [parsedRecords, setParsedRecords] = useState([])

  // Step 5: Import Outcome
  const [importSummary, setImportSummary] = useState(null)


  // Reset wizard
  const handleReset = () => {
    setCurrentStep(1)
    setFile(null)
    setWorkbook(null)
    setUploadError('')
    setSelectedSheet('')
    setRawHeaders([])
    setRawRows([])
    setColumnMappings({})
    setMappingError('')
    setParsedRecords([])
    setImportSummary(null)
  }

  // Handle file reading
  const processUploadedFile = (uploadedFile) => {
    setUploadError('')

    // Validate extension
    const name = uploadedFile.name.toLowerCase()
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const hasValidExt = validExtensions.some((ext) => name.endsWith(ext))
    if (!hasValidExt) {
      setUploadError('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.')
      return
    }

    // Validate size (10MB limit)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds the 10MB limit. Please upload a smaller timetable file.')
      return
    }

    setFile(uploadedFile)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        setWorkbook(wb)

        const firstSheet = wb.SheetNames[0]
        setSelectedSheet(firstSheet)
        loadSheetData(wb, firstSheet)
      } catch (err) {
        setUploadError(`Failed to parse file content: ${err.message || 'Corrupted file'}`)
      }
    }
    reader.onerror = () => {
      setUploadError('Error reading file. Please check file permissions.')
    }
    reader.readAsArrayBuffer(uploadedFile)
  }

  // Load and auto-map sheet
  const loadSheetData = (wb, sheetName) => {
    const ws = wb.Sheets[sheetName]
    if (!ws) return

    const json = XLSX.utils.sheet_to_json(ws, { header: 1 })
    if (!json || json.length < 2) {
      setUploadError('The selected worksheet contains no data rows.')
      return
    }

    const headers = (json[0] || []).map((h) => String(h || '').trim()).filter(Boolean)
    const rows = json.slice(1).filter((r) => r.some((c) => c !== undefined && c !== null && c !== ''))

    setRawHeaders(headers)
    setRawRows(rows)

    // Auto-detect mappings based on aliases
    const autoMappings = {}
    REQUIRED_FIELDS.forEach((field) => {
      const match = headers.find((h) => {
        const hNorm = h.toLowerCase().replace(/[_\-\s]+/g, ' ').trim()
        return field.aliases.some((alias) => hNorm.includes(alias) || alias.includes(hNorm))
      })
      if (match) {
        autoMappings[field.key] = match
      }
    })

    setColumnMappings(autoMappings)
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0])
    }
  }

  // Handle moving to Step 2
  const handleGoToStep2 = () => {
    if (!file || !workbook) {
      setUploadError('Please select or upload a valid timetable file to proceed.')
      return
    }
    setCurrentStep(2)
  }

  // Handle Sheet selection change in Step 2
  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName)
    loadSheetData(workbook, sheetName)
  }

  // Handle moving from Step 2 to Step 3 (Preview & Conflict Review)
  const handleGoToStep3 = () => {
    setMappingError('')

    // Validate required fields are mapped
    const missing = REQUIRED_FIELDS.filter((f) => f.required && !columnMappings[f.key])
    if (missing.length > 0) {
      setMappingError(`Please map all required fields: ${missing.map((m) => m.label).join(', ')}`)
      return
    }

    // Parse all raw rows against mapped columns
    const parsed = rawRows.map((row, index) => {
      const getVal = (key) => {
        const header = columnMappings[key]
        if (!header) return ''
        const hIdx = rawHeaders.indexOf(header)
        if (hIdx === -1) return ''
        const val = row[hIdx]
        return val !== undefined && val !== null ? String(val).trim() : ''
      }

      const faculty = getVal('faculty')
      const department = getVal('department')
      const course = getVal('course')
      const venueStr = getVal('venue')
      const dateStr = getVal('date')
      const startTime = getVal('startTime')
      const endTime = getVal('endTime')
      const batch = getVal('batch')
      const semester = getVal('semester')

      const issues = []
      let status = 'Valid' // 'Valid' | 'Conflict' | 'Unknown Venue' | 'Invalid Format'

      // 1. Missing required field validation
      if (!faculty || !course || !venueStr || !dateStr || !startTime || !endTime) {
        status = 'Invalid Format'
        issues.push('Missing one or more mandatory fields in row.')
      }

      // 2. Time validity check
      const startMin = parseTimeToMinutes(startTime)
      const endMin = parseTimeToMinutes(endTime)
      if (endMin <= startMin) {
        status = 'Invalid Format'
        issues.push(`End time (${endTime}) must be strictly after start time (${startTime}).`)
      }

      // 3. Venue resolution check
      const matchedVenue = venues.find((v) => {
        const vName = (v.name || '').toLowerCase()
        const vCode = (v.code || v.id || '').toLowerCase()
        const target = venueStr.toLowerCase()
        return target.includes(vCode) || target.includes(vName) || vName.includes(target)
      })

      if (!matchedVenue && status !== 'Invalid Format') {
        status = 'Unknown Venue'
        issues.push(`Venue "${venueStr}" was not found in campus database.`)
      }

      // 4. Overlap & Conflict Check against existing bookings & timetable
      if (status === 'Valid' && matchedVenue) {
        const targetDate = dateStr.includes('-') ? dateStr : '2026-10-26' // fallback date for sample

        // Check against timetable
        const hasTimetableConflict = existingTimetable.some((t) => {
          if (t.date === targetDate && (t.venueName === matchedVenue.name || t.venueId === matchedVenue.id)) {
            const tStart = parseTimeToMinutes(t.startTime)
            const tEnd = parseTimeToMinutes(t.endTime)
            return !(endMin <= tStart || startMin >= tEnd)
          }
          return false
        })

        if (hasTimetableConflict) {
          status = 'Conflict'
          issues.push(`Time slot overlaps with existing block on ${targetDate} for ${matchedVenue.name}.`)
        }

        // Check against existing reservations
        const bookingConflict = (existingBookings || []).find((b) => {
          if (b.status === 'Cancelled' || b.status === 'Rejected') return false
          const bVenue = (b.venueName || '').toLowerCase()
          const isVenueMatch = bVenue.includes(matchedVenue.name.toLowerCase()) || matchedVenue.name.toLowerCase().includes(bVenue)
          if (b.bookingDate === targetDate && isVenueMatch) {
            const [bStart, bEnd] = parseTimeSlot(b.timeSlot)
            return !(endMin <= bStart || startMin >= bEnd)
          }
          return false
        })

        if (bookingConflict) {
          status = 'Conflict'
          issues.push(`Time slot overlaps with reservation "${bookingConflict.purpose}" (${bookingConflict.applicantName}).`)
        }
      }

      return {
        rowIndex: index + 1,
        faculty,
        department,
        course,
        venue: matchedVenue ? matchedVenue.name : venueStr,
        matchedVenue,
        date: dateStr,
        startTime,
        endTime,
        batch,
        semester,
        status,
        issues,
        isExcluded: false
      }
    })

    setParsedRecords(parsed)
    setCurrentStep(3)
  }

  // Toggle exclusion of a record in Step 3
  const handleToggleExclude = (rowIndex) => {
    setParsedRecords((prev) =>
      prev.map((rec) => (rec.rowIndex === rowIndex ? { ...rec, isExcluded: !rec.isExcluded } : rec))
    )
  }

  // Step 4 Metrics Calculation
  const summaryMetrics = useMemo(() => {
    const total = parsedRecords.length
    const excluded = parsedRecords.filter((r) => r.isExcluded).length
    const toImport = parsedRecords.filter((r) => !r.isExcluded && (r.status === 'Valid' || r.status === 'Conflict')).length
    const conflicts = parsedRecords.filter((r) => r.status === 'Conflict' && !r.isExcluded).length
    const unknownVenues = parsedRecords.filter((r) => r.status === 'Unknown Venue' && !r.isExcluded).length
    const invalid = parsedRecords.filter((r) => r.status === 'Invalid Format' && !r.isExcluded).length

    const affectedVenues = Array.from(
      new Set(parsedRecords.filter((r) => !r.isExcluded).map((r) => r.venue))
    )

    return { total, excluded, toImport, conflicts, unknownVenues, invalid, affectedVenues }
  }, [parsedRecords])

  // Execute Import
  const handleExecuteImport = () => {
    const recordsToCommit = parsedRecords.filter((r) => !r.isExcluded && r.status !== 'Invalid Format')

    const newTimetableEntries = recordsToCommit.map((r) => ({
      id: `TT-IMP-${Date.now().toString().slice(-4)}-${r.rowIndex}`,
      venueId: r.matchedVenue ? r.matchedVenue.id : 'VN-GEN',
      venueName: r.venue,
      title: `${r.course} (${r.batch ? `Sec ${r.batch}` : 'Lecture'})`,
      date: r.date.includes('-') ? r.date : '2026-10-26',
      startTime: r.startTime,
      endTime: r.endTime,
      blockType: 'Academic Schedule',
      reason: `Imported via Academic Timetable (${r.semester || 'AY 2026-27'})`,
      faculty: r.faculty,
      department: r.department,
      recurrence: 'weekly',
      recurrenceEndDate: '2026-12-15'
    }))

    onImportComplete(newTimetableEntries)

    setImportSummary({
      importedCount: recordsToCommit.length,
      skippedCount: summaryMetrics.excluded + summaryMetrics.invalid,
      conflictsCount: summaryMetrics.conflicts,
      affectedVenues: summaryMetrics.affectedVenues
    })

    setCurrentStep(5)
  }

  // Download Error Report CSV
  const handleDownloadErrorReport = () => {
    const headers = ['Row', 'Status', 'Course', 'Faculty', 'Venue', 'Date', 'Time Slot', 'Issues / Reasons']
    const rows = parsedRecords.map((r) => [
      r.rowIndex,
      r.status,
      `"${r.course || ''}"`,
      `"${r.faculty || ''}"`,
      `"${r.venue || ''}"`,
      r.date,
      `"${r.startTime} - ${r.endTime}"`,
      `"${r.issues.join('; ')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Timetable_Import_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-wizard-title"
      >
        {/* Wizard Header & Progress Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Step {currentStep} of 5
              </span>
              <h2 id="import-wizard-title" className="text-base font-bold text-slate-900 dark:text-white">
                {currentStep === 1 && 'Upload Academic Timetable Spreadsheet'}
                {currentStep === 2 && 'Worksheet & Column Schema Mapping'}
                {currentStep === 3 && 'Timetable Preview & Conflict Analysis'}
                {currentStep === 4 && 'Import Execution Confirmation'}
                {currentStep === 5 && 'Import Completed Successfully'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Batch import faculty lectures, tutorials, exam slots, and lab schedules.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-100/60 dark:bg-slate-800/60 px-5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          {['1. Upload', '2. Mapping', '3. Preview', '4. Confirm', '5. Done'].map((stepName, i) => {
            const stepNum = i + 1
            const isCompleted = stepNum < currentStep
            const isCurrent = stepNum === currentStep
            return (
              <div
                key={stepName}
                className={`flex items-center gap-1.5 font-bold ${
                  isCurrent
                    ? 'text-blue-600 dark:text-blue-400'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                </div>
                <span className="hidden sm:inline">{stepName}</span>
              </div>
            )
          })}
        </div>

        {/* Scrollable Wizard Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* ================= STEP 1: UPLOAD ================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-800/50'
                }`}
              >
                <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Drag and drop your spreadsheet here, or browse files
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Supports Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) and Comma-Separated Values (<strong>.csv</strong>). Maximum file size: 10MB.
                </p>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors">
                    <span>Select File</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processUploadedFile(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {file && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB • {workbook ? `${workbook.SheetNames.length} sheet(s) detected` : 'Parsing...'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setWorkbook(null)
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: SCHEMA MAPPING ================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Sheet selector */}
              {workbook && workbook.SheetNames.length > 1 && (
                <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Workbook Worksheet:
                    </span>
                  </div>
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {workbook.SheetNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Map File Headers to System Attributes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Headers have been automatically matched where possible. Confirm or override fields before proceeding.
                </p>
              </div>

              {mappingError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mappingError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {REQUIRED_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-white">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {columnMappings[field.key] ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Matched
                        </span>
                      ) : field.required ? (
                        <span className="text-[10px] font-bold text-amber-500">Required</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Optional</span>
                      )}
                    </div>

                    <select
                      value={columnMappings[field.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setColumnMappings((prev) => ({ ...prev, [field.key]: val }))
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                    >
                      <option value="">-- Choose file column --</option>
                      {rawHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 3: PREVIEW & CONFLICT REVIEW ================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Timetable Validation & Conflict Analysis
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review row-by-row status. Checkbox allows excluding problematic entries from the final import.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Valid ({parsedRecords.filter((r) => r.status === 'Valid').length})
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Conflicts ({parsedRecords.filter((r) => r.status === 'Conflict').length})
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    Issues ({parsedRecords.filter((r) => r.status === 'Unknown Venue' || r.status === 'Invalid Format').length})
                  </span>
                </div>
              </div>

              {/* Responsive Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/60 dark:bg-slate-800/60 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <tr>
                        <th className="p-3 text-center">Include</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Course / Batch</th>
                        <th className="p-3">Faculty</th>
                        <th className="p-3">Venue</th>
                        <th className="p-3">Schedule</th>
                        <th className="p-3">Conflict / Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedRecords.map((r) => {
                        return (
                          <tr
                            key={r.rowIndex}
                            className={`hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition-colors ${
                              r.isExcluded ? 'opacity-40 bg-slate-100/50 dark:bg-slate-800/30' : ''
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={!r.isExcluded}
                                onChange={() => handleToggleExclude(r.rowIndex)}
                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                title={r.isExcluded ? 'Check to include' : 'Uncheck to exclude'}
                              />
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              {r.status === 'Valid' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Valid
                                </span>
                              )}
                              {r.status === 'Conflict' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  <AlertTriangle className="w-3 h-3" />
                                  Conflict
                                </span>
                              )}
                              {r.status === 'Unknown Venue' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  <Building className="w-3 h-3" />
                                  Unknown Venue
                                </span>
                              )}
                              {r.status === 'Invalid Format' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  <XCircle className="w-3 h-3" />
                                  Invalid Format
                                </span>
                              )}
                            </td>

                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                              {r.course}
                              {r.batch && (
                                <span className="block text-[11px] font-normal text-slate-500">
                                  Batch: {r.batch}
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-slate-700 dark:text-slate-300">
                              {r.faculty}
                              <span className="block text-[10px] text-slate-400">{r.department}</span>
                            </td>

                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                              {r.venue}
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <span className="font-mono text-xs">{r.startTime} - {r.endTime}</span>
                              <span className="block text-[10px] text-slate-400">{r.date}</span>
                            </td>

                            <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                              {r.issues.length > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  {r.issues.join(', ')}
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  Ready to import
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: CONFIRMATION ================= */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Timetable Import Summary</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Found</span>
                    <strong className="text-lg text-slate-900 dark:text-white">{summaryMetrics.total}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">To Import</span>
                    <strong className="text-lg text-emerald-600 dark:text-emerald-400">{summaryMetrics.toImport}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Conflicts</span>
                    <strong className="text-lg text-amber-600 dark:text-amber-400">{summaryMetrics.conflicts}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Excluded</span>
                    <strong className="text-lg text-slate-700 dark:text-slate-300">{summaryMetrics.excluded}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Affected Campus Venues ({summaryMetrics.affectedVenues.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {summaryMetrics.affectedVenues.map((v, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {summaryMetrics.conflicts > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Warning: <strong>{summaryMetrics.conflicts}</strong> conflicting entries are selected for import. In frontend preview, these will be scheduled alongside existing blocks for administrator inspection.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 5: RESULTS ================= */}
          {currentStep === 5 && importSummary && (
            <div className="space-y-5 text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Academic Timetable Import Completed!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  The schedule has been integrated into the campus timetable database. All new slots are now active across weekly and daily calendars.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedules Imported</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {importSummary.importedCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Records Skipped</span>
                  <div className="text-xl font-black text-slate-700 dark:text-slate-300">
                    {importSummary.skippedCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Conflicts Flagged</span>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {importSummary.conflictsCount}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadErrorReport}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Audit / Error Report</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 sm:p-5 bg-slate-100/60 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          {currentStep > 1 && currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <div>
            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleGoToStep2}
                disabled={!file}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue to Schema Mapping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleGoToStep3}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Preview & Validate Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Import Records</span>
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={() => {
                  handleReset()
                  onClose()
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Finish & View Timetable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

