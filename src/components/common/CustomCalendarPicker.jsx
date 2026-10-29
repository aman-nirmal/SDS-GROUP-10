import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CustomCalendarPicker({ selectedDate, onSelectDate, onClose }) {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date(2026, 9, 16)
  const [viewDate, setViewDate] = useState(initialDate)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()

  // Previous month trailing days
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = []
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i)
  }

  // Next month leading days
  const totalSlots = Math.ceil((firstDayIndex + daysInCurrentMonth) / 7) * 7
  const nextMonthDaysCount = totalSlots - (firstDayIndex + daysInCurrentMonth)

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(year, month + 1, 1))
  }

  const handlePickDate = (d) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    onSelectDate(`${year}-${mm}-${dd}`)
    onClose()
  }

  const handlePickToday = (e) => {
    e.stopPropagation()
    const now = new Date(2026, 9, 16) // academic session date
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    onSelectDate(`${now.getFullYear()}-${mm}-${dd}`)
    onClose()
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onSelectDate('')
    onClose()
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-15 left-0 sm:left-auto sm:right-0 w-[290px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-center mb-1">
        {daysOfWeek.map((day, idx) => (
          <span key={idx} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {/* Prev month days */}
        {prevMonthDays.map((d, i) => (
          <span key={`prev-${i}`} className="text-slate-300 dark:text-slate-600 py-1.5 text-[11px]">
            {d}
          </span>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
          const dayNum = i + 1
          const mm = String(month + 1).padStart(2, '0')
          const dd = String(dayNum).padStart(2, '0')
          const dateString = `${year}-${mm}-${dd}`
          const isSelected = selectedDate === dateString

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handlePickDate(dayNum)}
              className={`w-8 h-8 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${isSelected
                ? 'bg-blue-600 text-white font-bold shadow-xs scale-105'
                : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              {dayNum}
            </button>
          )
        })}

        {/* Next month days */}
        {Array.from({ length: nextMonthDaysCount }).map((_, i) => (
          <span key={`next-${i}`} className="text-slate-300 dark:text-slate-600 py-1.5 text-[11px]">
            {i + 1}
          </span>
        ))}
      </div>

      {/* Footer Actions: Clear & Today */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold">
        <button
          type="button"
          onClick={handleClear}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handlePickToday}
          className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          Today
        </button>
      </div>
    </div>
  )
}
