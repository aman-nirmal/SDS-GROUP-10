import React from 'react'
import {
  MapPin,
  Calendar,
  ChevronDown,
  ArrowRight,
  Monitor,
  Users,
  Presentation,
  Building
} from 'lucide-react'
import FlyingBirds from '../components/common/FlyingBirds'
import CustomCalendarPicker from '../components/common/CustomCalendarPicker'
import VenueTypeCard from '../components/common/VenueTypeCard'
import { formatDateDisplay } from '../utils/venueHelpers'

export default function HomePage({
  theme = 'light',
  selectedType = 'All Spaces',
  setSelectedType,
  selectedDate = '',
  setSelectedDate,
  isTypeDropdownOpen = false,
  setIsTypeDropdownOpen,
  isDatePickerOpen = false,
  setIsDatePickerOpen,
  onSearch,
  onSelectPopularType,
  onViewAllVenues
}) {
  const venueTypeOptions = [
    'All Spaces',
    'Classrooms',
    'Seminar Halls',
    'Auditoriums',
    'Laboratories',
    'Conference Rooms',
    'Meeting Rooms'
  ]

  const popularTypes = [
    {
      icon: Monitor,
      title: 'Classrooms',
      description: 'Regular lecture halls, tutorial rooms, and smart classrooms.',
      count: '42 Venues'
    },
    {
      icon: Users,
      title: 'Seminar Halls',
      description: 'Equipped for guest lectures, symposiums, and departmental workshops.',
      count: '12 Venues'
    },
    {
      icon: Presentation,
      title: 'Auditoriums',
      description: 'Large venues for campus events, cultural festivals, and annual conferences.',
      count: '4 Venues'
    },
    {
      icon: Building,
      title: 'Meeting Rooms',
      description: 'Focused spaces for club meetings, faculty discussions, and interviews.',
      count: '8 Venues'
    }
  ]

  return (
    <>
      {/* Hero Section: Wide Full-Bleed Right Layout */}
      <section className="relative pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pb-14 bg-[rgb(249,248,246)] dark:bg-[#0b0f19] z-20">
        {/* Desktop Full-Bleed Right Image Container */}
        <div className="hidden lg:block absolute top-0 bottom-0 left-[50%] xl:left-[48%] right-0 pointer-events-none select-none z-0 pl-3 xl:pl-4 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-end">
            {/* Subtle Circular Sky Glow behind the tower */}
            <div className="absolute top-4 right-16 w-80 xl:w-96 aspect-square rounded-full bg-gradient-to-tr from-sky-200/50 via-sky-100/35 to-transparent pointer-events-none -z-10"></div>

            {/* Dedicated Building + Sky Wrapper for Birds */}
            <div className="relative flex items-center justify-end w-full h-full">
              <FlyingBirds />
              <img
                src={theme === 'dark' ? '/coep_building_night.png' : '/coep_building.png'}
                alt="COEP Technological University Main Building"
                className="relative z-20 w-full h-full object-contain object-right max-h-[580px]"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 xl:col-span-6 space-y-4 sm:space-y-6 py-2 sm:py-6">
              <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                COEP TECHNOLOGICAL UNIVERSITY
              </div>

              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Book Venues,<br />
                Without the{' '}
                <span className="relative inline-block text-blue-600 dark:text-blue-400">
                  Hassle
                  <svg
                    className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 text-blue-500 overflow-visible pointer-events-none"
                    viewBox="0 0 100 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9.5C24 3.5 62 1.5 98 6.5C82 10.5 45 11.5 12 10.5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                Find and book classrooms, seminar halls, auditoriums and other campus venues easily.
              </p>

              {/* Quick Search Floating Bar */}
              <div className="pt-2">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 max-w-xl">
                  {/* Venue Type Picker */}
                  <div className="relative flex-1 w-full">
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="w-full h-12 sm:h-13 px-3.5 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                        <div className="text-left">
                          <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                            Venue Type
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {selectedType}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    {/* Venue Type Dropdown Menu */}
                    {isTypeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50">
                        {venueTypeOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSelectedType(opt)
                              setIsTypeDropdownOpen(false)
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                              selectedType === opt
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:block w-[1px] h-8 bg-slate-200 dark:bg-slate-800 my-auto"></div>

                  {/* Date Picker Button */}
                  <div className="relative flex-1 w-full">
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      className="w-full h-12 sm:h-13 px-3.5 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Calendar className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                        <div className="text-left">
                          <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                            Date
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {selectedDate ? formatDateDisplay(selectedDate) : 'Select date'}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    {/* Custom Calendar Dropdown */}
                    {isDatePickerOpen && (
                      <CustomCalendarPicker
                        selectedDate={selectedDate}
                        onSelectDate={(newDate) => {
                          setSelectedDate(newDate)
                          setIsDatePickerOpen(false)
                        }}
                        onClose={() => setIsDatePickerOpen(false)}
                      />
                    )}
                  </div>

                  {/* Search Button */}
                  <button
                    type="button"
                    onClick={onSearch}
                    className="w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Quick Campus Stats Pills */}
              <div className="pt-1 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">60+ Venues Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>Conflict-Free Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>Instant Request Tracking</span>
                </div>
              </div>
            </div>

            {/* Mobile-Only Illustration */}
            <div className="block lg:hidden mt-4 w-full relative overflow-hidden">
              <FlyingBirds />
              <img
                src={theme === 'dark' ? '/coep_building_night.png' : '/coep_building.png'}
                alt="COEP Technological University Main Building"
                className="relative z-20 w-full h-auto object-contain max-h-[360px] mx-auto select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Venue Types Section */}
      <section className="relative z-0 pt-4 pb-12 sm:pt-6 sm:pb-14 bg-[rgb(249,248,246)] dark:bg-[#0b0f19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                Browse Venues
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Popular Venue Types
              </h2>
            </div>
            <button
              type="button"
              onClick={onViewAllVenues}
              className="self-start sm:self-auto group inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <span>View All Venues</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {popularTypes.map((type) => (
              <div
                key={type.title}
                onClick={() => onSelectPopularType(type.title)}
                className="h-full flex flex-col"
              >
                <VenueTypeCard
                  icon={type.icon}
                  title={type.title}
                  description={type.description}
                  count={type.count}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-[rgb(249,248,246)] dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-10 text-left sm:text-left">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Book in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Check Availability</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Select your desired venue and inspect live open slots on the calendar.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Make a Booking</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Fill in event purpose, department, and faculty coordinator details.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 sm:p-0 rounded-2xl bg-white dark:bg-slate-900/60 sm:bg-transparent sm:dark:bg-transparent border sm:border-0 border-slate-200/80 dark:border-slate-800 shadow-xs sm:shadow-none">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                3
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Get Confirmation</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Receive approval notification and reservation slip from administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
