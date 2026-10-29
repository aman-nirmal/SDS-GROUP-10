import React, { useState, useMemo } from 'react'
import {
  FileSpreadsheet,
  Ban,
  GraduationCap,
  Wrench,
  BookOpen
} from 'lucide-react'
import TimetableCalendar from './TimetableCalendar'
import VenueBlockModal from './VenueBlockModal'
import TimetableImportWizard from './TimetableImportWizard'

export default function AdminTimetable({
  timetable = [],
  bookings = [],
  venues = [],
  onAddTimetableEntry,
  onDeleteTimetableEntry,
  onImportTimetable
}) {
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false)
  const [selectedVenueForBlock, setSelectedVenueForBlock] = useState(null)

  // Compute stats
  const stats = useMemo(() => {
    const total = timetable.length
    const academic = timetable.filter((t) => t.blockType === 'Academic Schedule').length
    const maintenance = timetable.filter((t) => t.blockType === 'Maintenance').length
    const exams = timetable.filter((t) => t.blockType === 'Examination').length
    const holds = timetable.filter((t) => t.blockType === 'Administrative Hold').length
    return { total, academic, maintenance, exams, holds }
  }, [timetable])

  const handleOpenBlockModal = (venue = null) => {
    setSelectedVenueForBlock(venue)
    setIsBlockModalOpen(true)
  }

  const handleSaveBlock = (newBlock) => {
    onAddTimetableEntry(newBlock)
  }

  const handleImportComplete = (newEntries) => {
    onImportTimetable(newEntries)
  }

  return (
    <div className="space-y-4">
      {/* Top Banner and Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Timetable & Physical Space Blocking
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {timetable.length} Active Blocks
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage faculty lectures, tutorials, exam schedules, and estate maintenance holds across all venues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImportWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer bg-white dark:bg-slate-800 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Import Timetable</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenBlockModal(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Block Venue</span>
            </button>
          </div>
        </div>

        {/* Timetable Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic</span>
              <strong className="text-base text-slate-900 dark:text-white">{stats.academic}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Maintenance</span>
              <strong className="text-base text-slate-900 dark:text-white">{stats.maintenance}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Examinations</span>
              <strong className="text-base text-slate-900 dark:text-white">{stats.exams}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Admin Holds</span>
              <strong className="text-base text-slate-900 dark:text-white">{stats.holds}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Calendar Interface */}
      <TimetableCalendar
        timetable={timetable}
        bookings={bookings}
        venues={venues}
        onDeleteEntry={onDeleteTimetableEntry}
        onOpenBlockModal={handleOpenBlockModal}
      />

      {/* Manual Venue Blocking Modal */}
      <VenueBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSaveBlock={handleSaveBlock}
        venues={venues}
        existingBookings={bookings}
        existingTimetable={timetable}
        preselectedVenue={selectedVenueForBlock}
      />

      {/* Excel / CSV Import Wizard */}
      <TimetableImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImportComplete={handleImportComplete}
        venues={venues}
        existingTimetable={timetable}
        existingBookings={bookings}
      />
    </div>
  )
}

