import React from 'react'
import {
  Compass,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
  Calendar
} from 'lucide-react'

const PUBLIC_CAMPUS_VENUES = [
  {
    id: 'g-vn-cog-lab',
    code: 'COG-LAB',
    name: 'Cognizant Lab',
    type: 'Computing & Technical Workshop Lab',
    location: 'Computer New Building (Computer Engineering)',
    capacity: '400 Persons',
    image: '/coep_building.png',
    publicAccess: 'Open for university coding workshops, hackathons, and approved technical events.'
  },
  {
    id: 'g-vn-mini-aud',
    code: 'MINI-AUD',
    name: 'Mini Auditorium',
    type: 'Auditorium & Seminar Theatre',
    location: 'Main Heritage Building (Academics Complex)',
    capacity: '275 Persons',
    image: '/coep_building.png',
    publicAccess: 'Open for academic presentations, departmental events, seminars, and student activities.'
  },
  {
    id: 'g-vn-1',
    name: 'Historic Main Victorian Building (1865)',
    type: 'Heritage Landmark & Administrative Hall',
    location: 'North Campus Quadrangle',
    capacity: '300 Persons',
    image: '/coep_building.png',
    publicAccess: 'Open for guided heritage walks on Saturdays & public academic ceremonies.'
  },
  {
    id: 'g-vn-2',
    name: 'BHAU Institute of Innovation & Entrepreneurship',
    type: 'Incubation Center & Auditorium',
    location: 'Boat Club Road, Mula Riverbank',
    capacity: '250 Seat Auditorium',
    image: '/photos/audi 2.jpeg',
    publicAccess: 'Open for guest symposiums, startup pitches, and public technology lectures.'
  },
  {
    id: 'g-vn-3',
    name: 'Historic Boat Club & Regatta Grounds',
    type: 'Riverside Regatta Pavilion',
    location: 'Sangam River Front',
    capacity: '1,500 Spectators',
    image: '/photos/seminar hall 2.jpeg',
    publicAccess: 'Home of the COEP Regatta. Public spectator gallery open during scheduled fixtures.'
  }
]

const PUBLIC_EVENTS = [
  {
    id: 'pe-1',
    title: 'MindSpark Technical Fest - Public Open Day',
    organizer: 'Student Gymkhana Secretariat',
    date: 'Oct 25, 2026',
    time: '10:00 AM - 06:00 PM',
    venue: 'Campus Quadrangle & ND01',
    status: 'Open to All'
  },
  {
    id: 'pe-2',
    title: 'BHAU Startup Demo Day & Investor Pitch',
    organizer: 'Incubation Cell',
    date: 'Nov 02, 2026',
    time: '02:00 PM - 06:00 PM',
    venue: 'BHAU Institute Auditorium',
    status: 'Free Registration'
  },
  {
    id: 'pe-3',
    title: 'COEP Annual Regatta Fleet Showcase',
    organizer: 'Boat Club Committee',
    date: 'Nov 15, 2026',
    time: '04:30 PM - 07:00 PM',
    venue: 'Boat Club River Pavilion',
    status: 'Open Gallery'
  }
]

export default function GuestPortal({ onNavigateLogin, onExploreVenues }) {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
      {/* Clean Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Compass className="w-3.5 h-3.5" />
              <span>Visitor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              COEP Campus Visitor Guide
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Public visitor information, campus access guidelines, and historic landmarks for COEP Technological University.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Student / Faculty Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onExploreVenues}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              View Venues
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Visitor Guidelines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Visitor Entry Point</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All external visitors must check in at Gate 1 (Shivajinagar main entrance) with a valid government photo ID.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Visiting Hours</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Campus is open for authorized visitors Monday through Saturday from 09:00 AM to 05:00 PM.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-1">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Booking Permissions</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Venue reservations for classrooms and labs require an authenticated institutional account.
            </p>
          </div>
        </div>

        {/* Public Landmarks */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Campus Heritage & Public Landmarks</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Key architectural venues accessible during open days.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PUBLIC_CAMPUS_VENUES.map((venue) => (
              <div key={venue.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
                <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/coep_building.png'
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] font-semibold flex items-center justify-between">
                    <span>{venue.location}</span>
                    <span className="font-bold">{venue.capacity}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{venue.name}</h3>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">{venue.type}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{venue.publicAccess}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Public Events Calendar */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Open Events</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Events open to visitors, school delegations, and alumni.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {PUBLIC_EVENTS.map((evt) => (
              <div key={evt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{evt.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {evt.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Organized by {evt.organizer} • {evt.venue}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 font-medium shrink-0">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {evt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {evt.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
