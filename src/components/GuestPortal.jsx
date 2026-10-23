import React, { useState } from 'react'
import {
  Compass,
  Building,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Info,
  ArrowRight,
  Shield,
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react'

const PUBLIC_CAMPUS_VENUES = [
  {
    id: 'g-vn-1',
    name: 'Historic Main Building (1865)',
    type: 'Heritage Landmark & Administrative Secretariat',
    location: 'North Campus Quadrangle',
    capacity: 'Public Walkthrough / Ceremonial Hall (300)',
    publicAccess: 'Open for guided campus heritage tours on Saturdays & public event days.',
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
    tags: ['Victorian Gothic', 'Heritage Site', 'Tower Clock']
  },
  {
    id: 'g-vn-2',
    name: 'BHAU Institute of Innovation & Entrepreneurship',
    type: 'Incubation Center & Modern Amphitheatre',
    location: 'Opposite Boat Club, Mula Riverbank',
    capacity: '250 Seat Main Auditorium + Innovation Pods',
    publicAccess: 'Open for public guest lectures, startup pitch fests, and entrepreneurship summits.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    tags: ['Startups', 'Auditorium', 'Smart Media']
  },
  {
    id: 'g-vn-3',
    name: 'COEP Historic Boat Club & Regatta Grounds',
    type: 'Riverside Regatta Pavilion & Sports Arena',
    location: 'Sangam / Mula River Front',
    capacity: '1,500 Spectator Open Arena',
    publicAccess: 'Home of the annual COEP Regatta; visitor spectator gallery accessible during regatta practice and public sports fixtures.',
    image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=800&q=80',
    tags: ['Oldest in India', 'Rowing / Kayaking', 'Outdoor']
  },
  {
    id: 'g-vn-4',
    name: 'North Drawing Hall (ND01)',
    type: 'Large Academic & Exhibition Hall',
    location: 'North Academic Wing, Floor 1',
    capacity: '180 Attendees',
    publicAccess: 'Accessible during inter-college festivals (MindSpark, Zest, Impressions) for exhibitions and robotics arenas.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Exhibitions', 'Tech Fests', 'Spacious']
  }
]

const PUBLIC_EVENTS = [
  {
    id: 'pe-1',
    title: 'MindSpark Technical Fest Public Open Day',
    organizer: 'Student Gymkhana Secretariat',
    date: '2026-10-25',
    time: '10:00 AM - 06:00 PM',
    venue: 'Campus Quadrangle & ND01',
    audience: 'Open to School Students, Parents, Alumni & Tech Enthusiasts',
    status: 'Public Registration Open'
  },
  {
    id: 'pe-2',
    title: 'BHAU Startup Demo Day & Angel Investor Pitch',
    organizer: 'Incubation Cell',
    date: '2026-11-02',
    time: '02:00 PM - 06:00 PM',
    venue: 'BHAU Institute Auditorium',
    audience: 'Open to Industry Mentors, Investors & Startup Founders',
    status: 'Free Visitor Passes'
  },
  {
    id: 'pe-3',
    title: 'COEP 98th Annual Regatta Practice & Public Fleet Showcase',
    organizer: 'Boat Club Committee',
    date: '2026-11-15',
    time: '04:30 PM - 07:00 PM',
    venue: 'Boat Club River Pavilion',
    audience: 'Open to Pune Citizens & Campus Visitors',
    status: 'Open Gallery Entry'
  }
]

export default function GuestPortal({ onNavigateLogin, onExploreVenues }) {
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedDate, setSelectedDate] = useState('2026-10-24')

  const filteredVenues = PUBLIC_CAMPUS_VENUES.filter((v) =>
    v.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    v.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
    v.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()))
  )

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Welcome Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4 backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Campus Portal • COEP Technological University</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
            Explore Pune's Oldest Engineering Campus
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Welcome to the public information center for COEP Technological University (Estd. 1854).
            Browse historic landmarks, check public exhibition venues, view open technical festivals, and access visitor arrival protocols.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <span>COEP Student / Faculty Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreVenues}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer backdrop-blur-xs"
            >
              Browse Public Venue Directory
            </button>
          </div>
        </div>
      </section>

      {/* Visitor Guidelines & Protocols Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Campus Visiting Hours</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Monday to Saturday: 09:30 AM - 05:30 PM. Closed on official university holidays.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Visitor Entry Gates</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Pedestrian check-in via North Gate (Wellesley Road). Vehicle parking near Boat Club South Gate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Visitor Pass Protocol</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Present a valid government photo ID at the main security post for a temporary visitor badge.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Space Reservation Rule</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
              Venue bookings are strictly reserved for verified university faculty, student bodies, and approved partners.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Section: Public Landmark Venues */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Landmarks & Architecture
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Featured Campus Facilities
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter public landmarks..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-xs font-medium placeholder-slate-400 outline-none focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-48 sm:h-56 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {venue.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{venue.name}</h3>
                    <p className="text-xs font-medium text-blue-600 mt-0.5">{venue.type}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {venue.publicAccess}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {venue.location}
                    </span>
                    <span className="font-semibold text-slate-700">{venue.capacity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Open Public Events */}
        <section className="space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Campus Calendar
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Open Exhibitions & Technical Summits
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Flagship university events welcoming external visitors, students, and technology enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PUBLIC_EVENTS.map((evt) => (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {evt.status}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{evt.title}</h3>
                  <p className="text-xs text-slate-500">{evt.organizer}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500">{evt.audience}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sign In CTA Banner for University Members */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white">
              <Shield className="w-3.5 h-3.5 text-blue-300" />
              <span>COEP Institutional Member Access</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Need to book a campus venue for lectures or club fests?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Sign in with your official university credentials (@coeptech.ac.in) via Microsoft Outlook SSO or Email OTP to access priority booking privileges, approvals, and personal schedules.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateLogin}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-blue-900 font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md shrink-0 cursor-pointer"
          >
            Sign In with University ID
          </button>
        </section>
      </main>
    </div>
  )
}
