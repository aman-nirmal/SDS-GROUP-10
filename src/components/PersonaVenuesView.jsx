import React, { useState, useMemo } from 'react'
import {
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FlaskConical,
  GraduationCap,
  Plus
} from 'lucide-react'
import { getVenueImageUrl, isLabVenue, isClassroomVenue } from '../App'

export default function PersonaVenuesView({
  currentUser,
  persona = 'hod', // 'hod' | 'dean' | 'faculty' | 'lab_assistant' | 'student' | 'club'
  venues = [],
  campusBookings = [],
  onBookVenue,
  defaultDepartment = ''
}) {
  const userDept = currentUser?.department || defaultDepartment || 'Computer Engineering'
  const isDean = persona === 'dean' || currentUser?.role === 'Dean'
  const isHod = persona === 'hod' || currentUser?.role === 'Head of Department (HOD)' || currentUser?.role === 'HOD'
  const isFaculty = persona === 'faculty' || currentUser?.role === 'Faculty'
  const isLabAssistant = persona === 'lab_assistant' || currentUser?.role === 'Lab Assistant'

  // Department selector: Dean sees all by default, HOD/Faculty/LabAssistant defaults to their home department
  const [selectedDept, setSelectedDept] = useState(isDean ? 'All' : userDept)
  const [selectedCategory, setSelectedCategory] = useState('All') // 'All' | 'Classrooms' | 'Laboratories' | 'Seminar Halls' | 'Auditoriums' | 'Meeting Rooms'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Available' | 'Occupied' | 'Maintenance'

  // Extract distinct departments from venues list
  const departmentsList = useMemo(() => {
    const list = Array.from(new Set(venues.map((v) => v.department).filter(Boolean))).sort()
    return ['All', ...list]
  }, [venues])

  // Filter venues under this persona's scope
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      // 1. Department filter
      if (selectedDept !== 'All') {
        const vDept = (venue.department || '').toLowerCase()
        const sDept = selectedDept.toLowerCase()
        const matchesDept = vDept === sDept || vDept.includes(sDept) || sDept.includes(vDept)
        if (!matchesDept) return false
      }

      // 2. Persona specific scoping when "All" is selected
      if (selectedDept === 'All' && !isDean) {
        // If not Dean, focus on the user's home department unless user explicitly changes
        const vDept = (venue.department || '').toLowerCase()
        const uDept = userDept.toLowerCase()
        if (isLabAssistant) {
          // Lab Assistant only sees Laboratories in their department
          if (!isLabVenue(venue) || (!vDept.includes(uDept) && !uDept.includes(vDept))) {
            return false
          }
        } else if (isHod || isFaculty) {
          if (!vDept.includes(uDept) && !uDept.includes(vDept)) {
            return false
          }
        }
      }

      // 3. Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Laboratories') {
          if (!isLabVenue(venue)) return false
        } else if (selectedCategory === 'Classrooms') {
          if (!isClassroomVenue(venue) || isLabVenue(venue)) return false
        } else if (selectedCategory === 'Seminar Halls') {
          const type = (venue.type || venue.category || '').toLowerCase()
          if (!type.includes('seminar')) return false
        } else if (selectedCategory === 'Auditoriums') {
          const type = (venue.type || venue.category || '').toLowerCase()
          if (!type.includes('auditorium')) return false
        } else if (selectedCategory === 'Meeting Rooms') {
          const type = (venue.type || venue.category || '').toLowerCase()
          if (!type.includes('meeting')) return false
        }
      }

      // 4. Status filter
      if (statusFilter !== 'All') {
        const vStatus = venue.status || 'Available'
        if (statusFilter === 'Available' && vStatus !== 'Available') return false
        if (statusFilter === 'Occupied' && vStatus !== 'Occupied') return false
        if (statusFilter === 'Maintenance' && !vStatus.toLowerCase().includes('maintenance')) return false
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const text = `${venue.code || ''} ${venue.new_hall_name || ''} ${venue.old_hall_name || ''} ${venue.name || ''} ${venue.department || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      return true
    })
  }, [venues, selectedDept, selectedCategory, statusFilter, searchQuery, isDean, isHod, isFaculty, isLabAssistant, userDept])

  // Aggregate metrics
  const totalCount = filteredVenues.length
  const labCount = filteredVenues.filter((v) => isLabVenue(v)).length
  const classroomCount = filteredVenues.filter((v) => isClassroomVenue(v) && !isLabVenue(v)).length
  const seminarCount = filteredVenues.filter((v) => (v.type || '').toLowerCase().includes('seminar') || (v.type || '').toLowerCase().includes('auditorium')).length

  // Find bookings today for a specific venue
  const getTodayBookings = (venue) => {
    const todayStr = new Date().toISOString().split('T')[0]
    const code = (venue.code || venue.new_hall_name || '').toLowerCase()
    const name = (venue.old_hall_name || venue.name || '').toLowerCase()

    return campusBookings.filter((b) => {
      const bVenue = (b.venue || b.venueName || '').toLowerCase()
      const matchesVenue = bVenue.includes(code) || bVenue.includes(name) || code.includes(bVenue)
      const matchesDate = (b.bookingDate || b.date) === todayStr
      return matchesVenue && matchesDate && b.status !== 'Rejected' && b.status !== 'Cancelled'
    })
  }

  // Persona Header Title & Description
  const headerContent = useMemo(() => {
    if (isDean) {
      return {
        badge: 'Dean Institutional Jurisdiction',
        title: 'All Campus Venues & Facilities',
        description:
          'Oversee university-wide infrastructure utilization across all engineering departments, central auditoriums, open courtyards, and innovation hubs.'
      }
    }
    if (isHod) {
      return {
        badge: `HOD Jurisdiction • ${selectedDept === 'All' ? userDept : selectedDept}`,
        title: `Venues Under ${selectedDept === 'All' ? userDept : selectedDept}`,
        description:
          'Manage department teaching classrooms, engineering laboratories, and departmental seminar halls. Review real-time occupancy and active academic sessions.'
      }
    }
    if (isLabAssistant) {
      return {
        badge: `Technical Custody • ${userDept}`,
        title: 'Assigned Department Laboratories',
        description:
          'Maintain equipment integrity, workstation inventory, and safety compliance. Review pending student & faculty booking requests requiring technical clearance.'
      }
    }
    if (isFaculty) {
      return {
        badge: `Teaching Jurisdiction • ${userDept}`,
        title: `Venues Under ${userDept}`,
        description:
          'Academic classrooms are auto-approved for your curriculum lectures. Department laboratories require 3-stage clearance (Lab Assistant + HOD + Dean).'
      }
    }
    return {
      badge: 'Campus Facility Directory',
      title: 'Accessible Campus Facilities',
      description: 'Explore and reserve verified campus venues, study halls, and innovation spaces.'
    }
  }, [isDean, isHod, isLabAssistant, isFaculty, selectedDept, userDept])

  return (
    <div className="space-y-6">
      {/* Top Persona Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{headerContent.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {headerContent.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {headerContent.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-2xl font-black text-white">{totalCount}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Total Spaces
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-2xl font-black text-emerald-400">{classroomCount}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Classrooms
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-2xl font-black text-amber-400">{labCount}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Laboratories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Department / Category Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venue code, name, or equipment..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Dropdown (for HOD / Dean / Admin) */}
            {(isDean || isHod || currentUser?.role === 'Administrator') && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Campus Departments' : d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {['All', 'Classrooms', 'Laboratories', 'Seminar Halls', 'Auditoriums', 'Meeting Rooms'].map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'All' ? 'All Space Types' : cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            No venues found in this scope
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your department filter, category, or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue, idx) => {
            const isLab = isLabVenue(venue)
            const isClassroom = isClassroomVenue(venue)
            const venueImage = getVenueImageUrl(venue)
            const capacity = venue.capacity || (venue.benches ? venue.benches * 2 : 60)
            const benches = venue.benches || Math.round(capacity / 2)
            const hallCode = venue.code || venue.new_hall_name || `VN-${idx + 1}`
            const venueTitle = venue.old_hall_name || venue.new_hall_name || venue.name || 'Campus Space'
            const todaySessions = getTodayBookings(venue)
            const status = venue.status || (todaySessions.length > 0 ? 'Occupied' : 'Available')

            return (
              <div
                key={venue.id || idx}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo & Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={venueImage}
                    alt={venueTitle}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/coep_building.png'
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent pointer-events-none" />

                  {/* Top Bar Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                    <span className="text-xs font-black tracking-wide text-white bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-xs shrink-0 max-w-[65%] truncate">
                      {hallCode}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                        isLab
                          ? 'bg-amber-950/80 text-amber-200 border-amber-400/40'
                          : 'bg-slate-900/80 text-slate-100 border-white/10'
                      }`}
                    >
                      {isLab ? 'Laboratory' : venue.type || 'Hall'}
                    </span>
                  </div>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold text-slate-100 text-[11px] flex items-center gap-1.5 drop-shadow-sm">
                      <Users className="w-3.5 h-3.5 text-blue-300" />
                      {capacity} Seats
                    </span>
                    <span className="text-[11px] font-medium text-slate-300 drop-shadow-sm">
                      {benches} Benches
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div>
                      <h3
                        className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        title={venueTitle}
                      >
                        {venueTitle}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{venue.department}</span>
                      </p>
                    </div>

                    {/* Lab Warning / Governance Badge */}
                    {isLab && (
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div className="text-[10px] font-bold text-amber-900 dark:text-amber-200 leading-tight">
                          3-Stage Protocol: Lab Assistant + HOD + Dean Clearance Required
                        </div>
                      </div>
                    )}

                    {/* Classroom Governance Badge for Faculty */}
                    {isFaculty && isClassroom && !isLab && (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="text-[10px] font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                          Instant Approved for your curriculum academic lectures
                        </div>
                      </div>
                    )}

                    {/* Features Tags */}
                    {Array.isArray(venue.features) && venue.features.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {venue.features.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Today's Schedule */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>Today's Sessions:</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      {todaySessions.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {todaySessions.slice(0, 2).map((s, si) => (
                            <div
                              key={si}
                              className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded"
                            >
                              <span className="truncate max-w-[60%]">{s.purpose || 'Session'}</span>
                              <span className="font-mono text-[10px] text-slate-500">{s.timeSlot || s.slot}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5">
                          No active bookings today. Slot gaps open.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    {onBookVenue && (
                      <button
                        type="button"
                        onClick={() => onBookVenue(venue)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {isLab
                            ? 'Book Laboratory Slot'
                            : isFaculty && isClassroom
                            ? 'Instant Lecture Booking'
                            : 'Reserve Space'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
