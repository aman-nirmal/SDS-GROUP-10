import React from 'react'
import {
  Building2,
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Award,
  Layers,
  Cpu
} from 'lucide-react'

export default function About({ onBackHome }) {
  const stats = [
    { label: 'Academic Legacy', value: '170+ Years', sub: 'Established in 1854' },
    { label: 'Campus Venues', value: '50+ Spaces', sub: 'Classrooms, Halls & Grounds' },
    { label: 'Reservation Flow', value: '100% Digital', sub: 'Zero Paper Bureaucracy' },
    { label: 'Unified Campus', value: 'North & South', sub: 'Seamless Multi-Site Booking' }
  ]

  const pillars = [
    {
      icon: Calendar,
      title: 'Automated Conflict Prevention',
      description:
        'Eliminates duplicate bookings and scheduling collisions with real-time slot checking across academic departments and student organizations.'
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Authorization',
      description:
        'Structured administrative tiers designed specifically for Faculty Coordinators, Club Representatives, Campus Security, and Site Administrators.'
    },
    {
      icon: Cpu,
      title: 'Modern Architecture',
      description:
        'Built with modern reactive tooling, lightning-fast client responsiveness, and enterprise-grade directory integration for official @coeptech.ac.in credentials.'
    },
    {
      icon: Layers,
      title: 'Auditing & Transparency',
      description:
        'Complete chronological audit trails for every reservation, status transition, and venue handover across the university.'
    }
  ]

  const campusZones = [
    {
      name: 'North Campus Quadrangle',
      tag: 'Heritage & Foundational Engineering',
      desc: 'Houses the historic 1865 Victorian Main Building, Department of Civil Engineering, Mechanical Workshop, and the BHAU Institute of Innovation.'
    },
    {
      name: 'South Campus Complex',
      tag: 'Modern Computing & Applied Sciences',
      desc: 'Features modern multi-tier lecture theaters, Computer Engineering and IT complexes, the Central Library, and advanced research facilities.'
    },
    {
      name: 'Sangam Riverfront & Gymkhana',
      tag: 'Athletics & Historic Regatta',
      desc: 'Home of the historic COEP Boat Club, riverfront rowing pavilions, sports gymkhana, and outdoor student gathering grounds.'
    }
  ]

  return (
    <div className="w-full min-h-screen bg-[rgb(249,248,246)] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Platform</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            <span>COEP Technological University</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            About <span className="text-blue-600 dark:text-blue-400">LOCUS</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            The centralized campus venue reservation and infrastructure scheduling portal built specifically to streamline space allocation across all university departments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 text-center"
            >
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-slate-900/80 dark:via-slate-900/40 dark:to-slate-950 p-8 sm:p-12 rounded-3xl border border-blue-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <Award className="w-4 h-4" />
              <span>Our Purpose</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Honoring heritage while simplifying modern campus operations
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Founded in 1854, COEP Technological University is one of Asia&apos;s oldest engineering institutions. Over the decades, campus venues have expanded across historical landmarks and contemporary academic wings. LOCUS unifies these resources into a single source of truth, eliminating scheduling uncertainty and ensuring equitable venue access for student activities, conferences, and examinations.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Designed for Campus Workflows
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Key capabilities built to solve traditional venue scheduling bottlenecks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/70 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-4 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {pillar.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Campus Coverage */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Campus Footprint & Coverage
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Integrated across the major geographic divisions of COEP Tech.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campusZones.map((zone, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{zone.tag}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {zone.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {zone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="text-center bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Ready to explore university facilities?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Browse available auditoriums, smart classrooms, and meeting halls with up-to-date schedule tracking.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackHome}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { About }
