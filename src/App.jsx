import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react'

// Modular Components & Pages
import LocusLogo from './components/common/LocusLogo'
import { LoginForm } from './components/auth/LoginForm'
import VenueBookingModal from './components/modals/VenueBookingModal'
import UserProfileModal from './components/UserProfileModal'
import HomePage from './pages/HomePage'
import VenuesPage from './pages/VenuesPage'
import EventsPage from './pages/EventsPage'
import About from './components/About'

// Role & Persona Portals
import AdminPanel, { INITIAL_BOOKINGS } from './components/AdminPanel'
import GuestPortal from './components/GuestPortal'
import HodPortal from './components/HodPortal'
import DeanPortal from './components/DeanPortal'
import StudentPortal from './components/StudentPortal'
import ClubPortal from './components/ClubPortal'
import SecurityPortal from './components/SecurityPortal'
import FacultyPortal from './components/FacultyPortal'
import LabAssistantPortal from './components/LabAssistantPortal'

// APIs, Supabase & Config
import { INITIAL_ROLE_REQUESTS } from './components/admin/mockAdminData'
import { venuesApi, bookingsApi, eventsApi, roleRequestsApi } from './lib/api'
import { supabase } from './lib/supabase'
import { ROUTE_MAP, parseRoute, updateBrowserUrl } from './routes/routeConfig'
import {
  formatDateDisplay,
  formatDateISO,
  isLabVenue,
  isClassroomVenue,
  getVenueImages,
  getVenueImageUrl,
  getVenueFaculty,
  classroomTimeSlots,
  extractNumericPrice,
  isDepartmentMatch
} from './utils/venueHelpers'

// Backwards compatibility re-exports for other components importing from App.jsx
export {
  formatDateDisplay,
  formatDateISO,
  isLabVenue,
  isClassroomVenue,
  getVenueImages,
  getVenueImageUrl,
  getVenueFaculty,
  classroomTimeSlots,
  extractNumericPrice,
  isDepartmentMatch,
  ROUTE_MAP,
  parseRoute,
  updateBrowserUrl,
  LoginForm
}

export default function App() {
  const initialRoute = useMemo(() => parseRoute(), [])

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locus-theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('locus-theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Venues loaded dynamically from backend API / Supabase
  const [venues, setVenues] = useState([])
  const [isLoadingVenues, setIsLoadingVenues] = useState(true)
  const [activeTab, _setActiveTab] = useState(initialRoute.tab)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const transitionTimerRef = useRef(null)

  const [selectedType, _setSelectedType] = useState(initialRoute.venueType || 'All Spaces')
  const [selectedDate, setSelectedDate] = useState('')
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedVenueForBooking, _setSelectedVenueForBooking] = useState(null)
  const [isProfileModalOpen, _setIsProfileModalOpen] = useState(initialRoute.isProfile)

  // Synchronized state setters that keep browser URL in sync
  const setSelectedType = useCallback((type) => {
    _setSelectedType(type)
    updateBrowserUrl({
      tab: activeTab,
      venue: selectedVenueForBooking,
      isProfile: isProfileModalOpen,
      type,
      replace: true
    })
  }, [activeTab, selectedVenueForBooking, isProfileModalOpen])

  const setSelectedVenueForBooking = useCallback((venue) => {
    _setSelectedVenueForBooking(venue)
    updateBrowserUrl({
      tab: activeTab,
      venue,
      isProfile: isProfileModalOpen,
      type: selectedType
    })
  }, [activeTab, isProfileModalOpen, selectedType])

  const setIsProfileModalOpen = useCallback((open) => {
    _setIsProfileModalOpen(open)
    updateBrowserUrl({
      tab: activeTab,
      venue: selectedVenueForBooking,
      isProfile: open,
      type: selectedType
    })
  }, [activeTab, selectedVenueForBooking, selectedType])

  // Sleek professional page transition handler (Disappear -> Appear) with URL syncing
  const setActiveTab = useCallback((nextTab, options = {}) => {
    const { immediate = false, skipUrlSync = false } = options
    if (nextTab === activeTab && !isPageTransitioning) return

    if (!skipUrlSync) {
      updateBrowserUrl({
        tab: nextTab,
        venue: selectedVenueForBooking,
        isProfile: isProfileModalOpen,
        type: selectedType
      })
    }

    if (immediate) {
      _setActiveTab(nextTab)
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
    }

    // Disappearance phase: smoothly fades out
    setIsPageTransitioning(true)

    transitionTimerRef.current = setTimeout(() => {
      _setActiveTab(nextTab)
      window.scrollTo({ top: 0, behavior: 'instant' })

      requestAnimationFrame(() => {
        setIsPageTransitioning(false)
      })
    }, 95)
  }, [activeTab, isPageTransitioning, selectedVenueForBooking, isProfileModalOpen, selectedType])

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }
    }
  }, [])

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Listen to browser Back and Forward navigation and synchronize all screens
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRoute()

      const protectedTabs = ['student', 'faculty', 'lab_assistant', 'hod', 'dean', 'club', 'admin', 'security']
      let isAuthed = false
      try {
        isAuthed = !!localStorage.getItem('locus_auth_user')
      } catch {
        isAuthed = false
      }

      if (protectedTabs.includes(parsed.tab) && !isAuthed) {
        setActiveTab('login', { skipUrlSync: true })
        setIsMobileMenuOpen(false)
        return
      }

      _setActiveTab(parsed.tab)
      if (parsed.venueSlug && venues.length > 0) {
        const found = venues.find(
          (v) =>
            v.new_hall_name?.toLowerCase() === parsed.venueSlug.toLowerCase() ||
            v.old_hall_name?.toLowerCase() === parsed.venueSlug.toLowerCase() ||
            v.code?.toLowerCase() === parsed.venueSlug.toLowerCase() ||
            String(v.id) === String(parsed.venueSlug)
        )
        _setSelectedVenueForBooking(
          found || {
            new_hall_name: parsed.venueSlug,
            department: 'COEP Technological University',
            benches: 30
          }
        )
      } else {
        _setSelectedVenueForBooking(null)
      }

      _setIsProfileModalOpen(parsed.isProfile)
      if (parsed.venueType) {
        _setSelectedType(parsed.venueType)
      }
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [venues, setActiveTab])

  // Synchronize initial URL state to address bar if launched at root or alias
  useEffect(() => {
    updateBrowserUrl({
      tab: initialRoute.tab,
      venue: initialRoute.venueSlug,
      isProfile: initialRoute.isProfile,
      type: initialRoute.venueType,
      replace: true
    })
  }, [initialRoute.isProfile, initialRoute.tab, initialRoute.venueSlug, initialRoute.venueType])

  // On initial mount or venues update, resolve any venue specified in URL
  useEffect(() => {
    if (initialRoute.venueSlug && venues && venues.length > 0) {
      const match = venues.find(
        (v) =>
          v.new_hall_name?.toLowerCase() === initialRoute.venueSlug.toLowerCase() ||
          v.old_hall_name?.toLowerCase() === initialRoute.venueSlug.toLowerCase() ||
          v.code?.toLowerCase() === initialRoute.venueSlug.toLowerCase() ||
          String(v.id) === String(initialRoute.venueSlug)
      )
      if (match) {
        _setSelectedVenueForBooking(match)
      } else {
        _setSelectedVenueForBooking({
          new_hall_name: initialRoute.venueSlug,
          department: 'COEP Technological University',
          benches: 30
        })
      }
    }
  }, [venues, initialRoute.venueSlug])

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_auth_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [roleRequests, setRoleRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_role_requests')
      return stored ? JSON.parse(stored) : INITIAL_ROLE_REQUESTS
    } catch {
      return INITIAL_ROLE_REQUESTS
    }
  })

  const handleUserSubmitRoleRequest = async (newRequest) => {
    setRoleRequests((prev) => {
      const updated = [newRequest, ...prev]
      try {
        localStorage.setItem('locus_admin_role_requests', JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
    try {
      await roleRequestsApi.create(newRequest)
    } catch (err) {
      console.warn('Backend role request sync failed:', err)
    }
  }

  const [campusBookings, setCampusBookings] = useState(() => {
    try {
      const stored = localStorage.getItem('locus_admin_bookings')
      return stored ? JSON.parse(stored) : INITIAL_BOOKINGS
    } catch {
      return INITIAL_BOOKINGS
    }
  })

  const pendingHodCount = campusBookings.filter(
    (b) => b.status === 'Pending' || b.status === 'Pending HOD Approval' || b.status === 'Pending Sanction'
  ).length

  const pendingDeanCount = campusBookings.filter(
    (b) => b.status === 'Pending Dean Approval'
  ).length

  const pendingLabAssistantCount = campusBookings.filter(
    (b) => b.status === 'Pending Lab Assistant Approval' || b.status === 'Pending Lab Clearance'
  ).length

  const [_userBookings, setUserBookings] = useState([])
  const [events, setEvents] = useState([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // Fetch Venues from Backend API / Supabase
  useEffect(() => {
    async function loadVenues() {
      try {
        setIsLoadingVenues(true)
        const res = await venuesApi.getAll()
        const venueList = res?.venues || (Array.isArray(res) ? res : [])
        if (venueList.length > 0) {
          setVenues(venueList.map((v) => ({ ...v, image: getVenueImageUrl(v) })))
          setIsLoadingVenues(false)
          return
        }
      } catch (err) {
        console.warn('Backend venues fetch failed, trying supabase:', err)
      }

      if (!supabase) {
        setIsLoadingVenues(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('is_active', true)
          .order('new_hall_name', { ascending: true })

        if (!error && data && data.length > 0) {
          setVenues(data.map((v) => ({ ...v, image: getVenueImageUrl(v) })))
        }
      } catch (err) {
        console.warn('Supabase fetch failed:', err)
      } finally {
        setIsLoadingVenues(false)
      }
    }

    loadVenues()
  }, [])

  // Fetch Events from Backend API / Supabase
  useEffect(() => {
    async function loadEvents() {
      try {
        setIsLoadingEvents(true)
        const res = await eventsApi.getAll()
        const eventList = res?.events || (Array.isArray(res) ? res : [])
        if (eventList.length > 0) {
          setEvents(eventList)
          setIsLoadingEvents(false)
          return
        }
      } catch (err) {
        console.warn('Backend events fetch failed, trying supabase:', err)
      }

      if (!supabase) {
        setIsLoadingEvents(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })

        if (!error && data && data.length > 0) {
          setEvents(data)
        }
      } catch (err) {
        console.warn('Supabase events fetch failed:', err)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    loadEvents()
  }, [])

  // Sync Bookings & Role Requests with Backend on Mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [bookingsRes, roleRequestsRes] = await Promise.allSettled([
          bookingsApi.getAll(),
          roleRequestsApi.getAll()
        ])
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.bookings?.length > 0) {
          setCampusBookings(bookingsRes.value.bookings)
          try {
            localStorage.setItem('locus_admin_bookings', JSON.stringify(bookingsRes.value.bookings))
          } catch {
            // ignore
          }
        }
        if (roleRequestsRes.status === 'fulfilled' && roleRequestsRes.value?.requests?.length > 0) {
          setRoleRequests(roleRequestsRes.value.requests)
          try {
            localStorage.setItem('locus_admin_role_requests', JSON.stringify(roleRequestsRes.value.requests))
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Failed to load initial backend bookings or role requests:', err)
      }
    }

    loadBackendData()
  }, [])

  const handleNavClick = (tab) => {
    const protectedTabs = ['student', 'faculty', 'lab_assistant', 'hod', 'dean', 'club', 'admin', 'security']
    if (protectedTabs.includes(tab) && !currentUser) {
      setActiveTab('login')
      setIsMobileMenuOpen(false)
      return
    }

    if (tab === activeTab && !selectedVenueForBooking && !isProfileModalOpen) {
      setIsMobileMenuOpen(false)
      return
    }

    if (tab === 'venues') {
      setSelectedType('All Spaces')
    }

    if (selectedVenueForBooking) _setSelectedVenueForBooking(null)
    if (isProfileModalOpen) _setIsProfileModalOpen(false)

    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  const handleUpdateBookingStatus = async (bookingId, newStatus, reason = '', updatedFields = {}) => {
    setCampusBookings((prev) => {
      const updated = prev.map((b) => ((b.id === bookingId || b.ref === bookingId) ? { ...b, status: newStatus, ...updatedFields } : b))
      try {
        localStorage.setItem('locus_admin_bookings', JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
    setUserBookings((prev) =>
      prev.map((b) => ((b.id === bookingId || b.ref === bookingId) ? { ...b, status: newStatus, ...updatedFields } : b))
    )

    try {
      await bookingsApi.updateStatus(bookingId, newStatus, reason, currentUser?.name || 'Reviewer')
    } catch (err) {
      console.warn('Backend booking status update error:', err)
    }
  }

  const handleAddBooking = async (newBooking) => {
    try {
      const res = await bookingsApi.create(newBooking)
      const created = res.booking || newBooking
      setCampusBookings((prev) => {
        const updated = [created, ...prev]
        try {
          localStorage.setItem('locus_admin_bookings', JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })
      setUserBookings((prev) => [created, ...prev])
      return { success: true, booking: created }
    } catch (err) {
      console.warn('Backend booking creation error:', err)
      if (err.status === 409 || err.data?.isConflict) {
        alert(err.data?.error || err.message)
        return { success: false, error: err.message, isConflict: true }
      }
      setCampusBookings((prev) => {
        const updated = [newBooking, ...prev]
        try {
          localStorage.setItem('locus_admin_bookings', JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })
      setUserBookings((prev) => [newBooking, ...prev])
      return { success: true, booking: newBooking }
    }
  }

  // Content router for all navigation tabs & personas
  const renderTabContent = () => {
    switch (activeTab) {
      case 'venues':
        return (
          <VenuesPage
            venues={venues}
            isLoading={isLoadingVenues}
            initialType={selectedType}
            initialDate={selectedDate}
            onSelectVenue={(hall) => setSelectedVenueForBooking(hall)}
            onBackHome={() => setActiveTab('home')}
          />
        )
      case 'events':
        return (
          <EventsPage
            events={events}
            isLoading={isLoadingEvents}
            onExploreVenues={() => setActiveTab('venues')}
            onBackHome={() => setActiveTab('home')}
          />
        )
      case 'my-bookings':
        return (
          <StudentPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
            campusBookings={campusBookings}
            venues={venues}
            onExploreVenues={() => setActiveTab('venues')}
            onBookVenue={(v) => {
              setSelectedVenueForBooking(v)
            }}
            onUpdateStatus={handleUpdateBookingStatus}
          />
        )
      case 'about':
        return <About onBackHome={() => setActiveTab('home')} />

      case 'login':
        return (
          <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
            <LoginForm
              onLoginSuccess={(user) => {
                if (user) {
                  setCurrentUser(user)
                  try {
                    localStorage.setItem('locus_auth_user', JSON.stringify(user))
                  } catch {
                    // ignore
                  }
                  if (user.role === 'Administrator') {
                    setActiveTab('admin')
                    return
                  } else if (user.role === 'Head of Department (HOD)' || user.role === 'HOD') {
                    setActiveTab('hod')
                    return
                  } else if (user.role === 'Dean') {
                    setActiveTab('dean')
                    return
                  } else if (user.role === 'Faculty') {
                    setActiveTab('faculty')
                    return
                  } else if (user.role === 'Lab Assistant') {
                    setActiveTab('lab_assistant')
                    return
                  } else if (user.role === 'Club Lead') {
                    setActiveTab('club')
                    return
                  } else if (user.role === 'Student') {
                    setActiveTab('student')
                    return
                  } else if (user.role === 'Security Guard') {
                    setActiveTab('security')
                    return
                  }
                }
                setActiveTab('home')
              }}
            />
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        )
      case 'guest':
        return (
          <GuestPortal
            onNavigateLogin={() => setActiveTab('login')}
            onExploreVenues={() => setActiveTab('venues')}
          />
        )
      case 'faculty':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Faculty' || user.role === 'Administrator' ? 'faculty' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <FacultyPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
            bookings={campusBookings}
            venues={venues}
            onAddBooking={handleAddBooking}
            onBookVenue={(v) => {
              setSelectedVenueForBooking(v)
            }}
          />
        )
      case 'lab_assistant':
      case 'lab-assistant':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Lab Assistant' || user.role === 'Administrator' ? 'lab_assistant' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <LabAssistantPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
            bookings={campusBookings}
            venues={venues}
            onUpdateStatus={handleUpdateBookingStatus}
            onBookVenue={(v) => {
              setSelectedVenueForBooking(v)
            }}
          />
        )
      case 'hod':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Head of Department (HOD)' || user.role === 'HOD' || user.role === 'Administrator' ? 'hod' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <HodPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
            bookings={campusBookings}
            venues={venues}
            onUpdateStatus={handleUpdateBookingStatus}
            onBookVenue={(v) => {
              setSelectedVenueForBooking(v)
            }}
          />
        )
      case 'dean':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Dean' || user.role === 'Administrator' ? 'dean' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <DeanPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
            bookings={campusBookings}
            venues={venues}
            onUpdateStatus={handleUpdateBookingStatus}
            onBookVenue={(v) => {
              setSelectedVenueForBooking(v)
            }}
          />
        )
      case 'student':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Student' || user.role === 'Administrator' ? 'student' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <StudentPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
            campusBookings={campusBookings}
            venues={venues}
            onExploreVenues={() => setActiveTab('venues')}
            onBookVenue={(v) => {
              setSelectedVenueForBooking(v)
            }}
            onUpdateStatus={handleUpdateBookingStatus}
          />
        )
      case 'club':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Club Lead' || user.role === 'Administrator' ? 'club' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <ClubPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'admin':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Administrator' ? 'admin' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <AdminPanel
            currentUser={currentUser}
            onBackHome={() => setActiveTab('home')}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      case 'security':
        if (!currentUser) {
          return (
            <div className="flex-1 py-12 sm:py-20 px-4 flex flex-col items-center justify-center">
              <LoginForm
                onLoginSuccess={(user) => {
                  if (user) {
                    setCurrentUser(user)
                    try {
                      localStorage.setItem('locus_auth_user', JSON.stringify(user))
                    } catch {
                      // ignore
                    }
                    setActiveTab(user.role === 'Security Guard' || user.role === 'Administrator' ? 'security' : 'home')
                  }
                }}
              />
            </div>
          )
        }
        return (
          <SecurityPortal
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
        )
      default:
        return (
          <HomePage
            theme={theme}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isTypeDropdownOpen={isTypeDropdownOpen}
            setIsTypeDropdownOpen={setIsTypeDropdownOpen}
            isDatePickerOpen={isDatePickerOpen}
            setIsDatePickerOpen={setIsDatePickerOpen}
            onSearch={() => handleNavClick('venues')}
            onSelectPopularType={(title) => {
              setSelectedVenueForBooking(title)
            }}
            onViewAllVenues={() => setActiveTab('venues')}
          />
        )
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[rgb(249,248,246)] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden transition-colors duration-300`}>
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[rgb(249,248,246)]/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div onClick={() => handleNavClick('home')} className="cursor-pointer">
            <LocusLogo size="default" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`transition-colors cursor-pointer relative pb-1 ${
                activeTab === 'home'
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`transition-colors cursor-pointer relative pb-1 ${
                activeTab === 'venues'
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Venues
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`transition-colors cursor-pointer relative pb-1 ${
                activeTab === 'events'
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Events
            </button>

            <button
              type="button"
              onClick={() => handleNavClick(currentUser?.role === 'Student' ? 'student' : 'my-bookings')}
              className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                activeTab === 'my-bookings' || activeTab === 'student'
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>My Bookings</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`transition-colors cursor-pointer relative pb-1 ${
                activeTab === 'about'
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              About
            </button>

            {currentUser && currentUser.role === 'Faculty' && (
              <button
                type="button"
                onClick={() => handleNavClick('faculty')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                  activeTab === 'faculty'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Faculty Venues</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Lab Assistant' && (
              <button
                type="button"
                onClick={() => handleNavClick('lab_assistant')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                  activeTab === 'lab_assistant'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Lab Clearances</span>
                {pendingLabAssistantCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold ml-0.5">
                    {pendingLabAssistantCount}
                  </span>
                )}
              </button>
            )}

            {currentUser && (currentUser.role === 'Head of Department (HOD)' || currentUser.role === 'HOD') && (
              <button
                type="button"
                onClick={() => handleNavClick('hod')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                  activeTab === 'hod'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>HOD Sanctions</span>
                {pendingHodCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold ml-0.5">
                    {pendingHodCount}
                  </span>
                )}
              </button>
            )}

            {currentUser && currentUser.role === 'Dean' && (
              <button
                type="button"
                onClick={() => handleNavClick('dean')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                  activeTab === 'dean'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Dean Clearance</span>
                {pendingDeanCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-600 text-white font-bold ml-0.5">
                    {pendingDeanCount}
                  </span>
                )}
              </button>
            )}

            {currentUser && currentUser.role === 'Club Lead' && (
              <button
                type="button"
                onClick={() => handleNavClick('club')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                  activeTab === 'club'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Club Bookings</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Security Guard' && (
              <button
                type="button"
                onClick={() => handleNavClick('security')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Gate Scanner</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Administrator' && (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`transition-colors cursor-pointer relative pb-1 flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer shadow-2xs"
                  title="View Profile, Credentials & Switch Role"
                  aria-label="Account and Institutional Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="font-bold leading-tight line-clamp-1">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(null)
                    try {
                      localStorage.removeItem('locus_auth_user')
                    } catch {
                      // ignore
                    }
                    handleNavClick('home')
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick(currentUser ? 'admin' : 'login')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs"
            >
              {currentUser ? 'Console' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-[rgb(249,248,246)] dark:bg-[#0b0f19] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'home' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('venues')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'venues' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Venues Catalog
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('events')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'events' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'about' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              About
            </button>

            <button
              type="button"
              onClick={() => handleNavClick(currentUser?.role === 'Student' ? 'student' : 'my-bookings')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'my-bookings' || activeTab === 'student' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              My Bookings
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Profile & Role Requests</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Faculty' && (
              <button
                type="button"
                onClick={() => handleNavClick('faculty')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${activeTab === 'faculty' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span>Faculty Venues</span>
              </button>
            )}

            {currentUser && currentUser.role === 'Lab Assistant' && (
              <button
                type="button"
                onClick={() => handleNavClick('lab_assistant')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${activeTab === 'lab_assistant' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span>Lab Clearances</span>
                {pendingLabAssistantCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-600 text-white font-bold">
                    {pendingLabAssistantCount}
                  </span>
                )}
              </button>
            )}

            {currentUser && (currentUser.role === 'Head of Department (HOD)' || currentUser.role === 'HOD') && (
              <button
                type="button"
                onClick={() => handleNavClick('hod')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${activeTab === 'hod' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span>HOD Sanctions</span>
                {pendingHodCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold">
                    {pendingHodCount}
                  </span>
                )}
              </button>
            )}

            {currentUser && currentUser.role === 'Dean' && (
              <button
                type="button"
                onClick={() => handleNavClick('dean')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${activeTab === 'dean' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span>Dean Clearance</span>
                {pendingDeanCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-600 text-white font-bold">
                    {pendingDeanCount}
                  </span>
                )}
              </button>
            )}

            {currentUser && currentUser.role === 'Club Lead' && (
              <button
                type="button"
                onClick={() => handleNavClick('club')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'club' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Club Bookings
              </button>
            )}

            {currentUser && currentUser.role === 'Security Guard' && (
              <button
                type="button"
                onClick={() => handleNavClick('security')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'security' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Gate Scanner
              </button>
            )}

            {currentUser && currentUser.role === 'Administrator' && (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTab === 'admin' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Admin Console
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Dynamic View with Page Transition */}
      <main
        id="main-content"
        className={`flex-1 flex flex-col page-transition-wrapper ${
          isPageTransitioning ? 'page-disappear' : 'page-appear'
        }`}
      >
        <div key={activeTab} className="flex-1 flex flex-col page-content-mount">
          {renderTabContent()}
        </div>
      </main>

      {/* Interactive Venue Reservation Modal */}
      {selectedVenueForBooking && (
        <VenueBookingModal
          venue={
            typeof selectedVenueForBooking === 'object'
              ? selectedVenueForBooking
              : venues.find(
                (v) =>
                  v.new_hall_name === selectedVenueForBooking ||
                  v.old_hall_name === selectedVenueForBooking
              ) || {
                new_hall_name: selectedVenueForBooking,
                department: 'COEP Technological University',
                benches: 30
              }
          }
          defaultDate={selectedDate}
          currentUser={currentUser}
          onClose={() => setSelectedVenueForBooking(null)}
          onSubmitBooking={(bookingData) => {
            handleAddBooking(bookingData)
          }}
        />
      )}

      {/* Campus Footer */}
      <footer className="mt-auto border-t border-slate-200/90 dark:border-slate-800 bg-[rgb(244,242,238)] dark:bg-[#070b12] text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80 dark:border-slate-800/80">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div onClick={() => setActiveTab('home')} className="inline-block cursor-pointer">
                <LocusLogo />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Centralized venue reservation portal for COEP Technological University. Simplifying access to classrooms, auditoriums, and seminar halls across North and South campus.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Status: All Services Operational</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('venues')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Explore Venues
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-bookings')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    My Bookings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    About LOCUS
                  </button>
                </li>
              </ul>
            </div>

            {/* Venue Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                Venues
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                {['Classrooms', 'Seminar Halls', 'Auditoriums', 'Meeting Rooms'].map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType(cat)
                        setActiveTab('venues')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Campus & Support */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('guest')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Visitor Guidelines
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Booking Guidelines')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Booking Guidelines
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('IT Helpdesk')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    IT Helpdesk
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Privacy Policy')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedVenueForBooking('Terms of Use')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 tracking-wider">LOCUS</span>
              <span>&bull;</span>
              <span>COEP Technological University &copy; 2026. All rights reserved.</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
              Wellesley Road, Shivajinagar, Pune - 411005, Maharashtra, India
            </div>
          </div>
        </div>
      </footer>

      {/* User Profile & Role Elevation Requests Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        roleRequests={roleRequests}
        onSubmitRequest={handleUserSubmitRoleRequest}
        onSwitchUser={(user, targetPortal) => {
          setCurrentUser(user)
          try {
            localStorage.setItem('locus_auth_user', JSON.stringify(user))
          } catch {
            // ignore
          }
          if (targetPortal) setActiveTab(targetPortal)
          setIsProfileModalOpen(false)
        }}
      />
    </div>
  )
}
