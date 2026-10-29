// Universal Route Table mapping view tabs to clean canonical URLs
export const ROUTE_MAP = {
  home: '/',
  venues: '/venues',
  events: '/events',
  'my-bookings': '/my-bookings',
  student: '/my-bookings',
  about: '/about',
  login: '/login',
  admin: '/admin',
  hod: '/hod',
  dean: '/dean',
  faculty: '/faculty',
  lab_assistant: '/lab-assistant',
  'lab-assistant': '/lab-assistant',
  club: '/club',
  security: '/security',
  guest: '/guest',
  profile: '/profile'
}

export function parseRoute(
  pathname = (typeof window !== 'undefined' ? window.location.pathname : '/'),
  search = (typeof window !== 'undefined' ? window.location.search : '')
) {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/'
  const params = new URLSearchParams(search || '')

  let tab = 'home'
  let venueSlug = params.get('venue') || params.get('book') || null
  let isProfile = params.get('modal') === 'profile' || cleanPath === '/profile'
  let venueType = params.get('type') || 'All Spaces'

  if (cleanPath === '/' || cleanPath === '/home') {
    tab = 'home'
  } else if (cleanPath === '/venues' || cleanPath.startsWith('/venues/')) {
    tab = 'venues'
    if (cleanPath.startsWith('/venues/')) {
      const slug = cleanPath.replace('/venues/', '').trim()
      if (slug) venueSlug = decodeURIComponent(slug)
    }
  } else if (cleanPath === '/events') {
    tab = 'events'
  } else if (cleanPath === '/my-bookings' || cleanPath === '/bookings' || cleanPath === '/student') {
    tab = 'my-bookings'
  } else if (cleanPath === '/about') {
    tab = 'about'
  } else if (cleanPath === '/login') {
    tab = 'login'
  } else if (cleanPath === '/admin') {
    tab = 'admin'
  } else if (cleanPath === '/hod') {
    tab = 'hod'
  } else if (cleanPath === '/dean') {
    tab = 'dean'
  } else if (cleanPath === '/faculty') {
    tab = 'faculty'
  } else if (cleanPath === '/lab-assistant' || cleanPath === '/lab_assistant') {
    tab = 'lab_assistant'
  } else if (cleanPath === '/club') {
    tab = 'club'
  } else if (cleanPath === '/security') {
    tab = 'security'
  } else if (cleanPath === '/guest') {
    tab = 'guest'
  } else if (cleanPath === '/profile') {
    tab = 'home'
    isProfile = true
  }

  return { tab, venueSlug, isProfile, venueType }
}

export function updateBrowserUrl({ tab, venue = null, isProfile = false, type = 'All Spaces', replace = false }) {
  if (typeof window === 'undefined') return

  let basePath = ROUTE_MAP[tab] || '/'
  const params = new URLSearchParams()

  if (isProfile) {
    if (tab === 'home' || !tab) {
      basePath = '/profile'
    } else {
      params.set('modal', 'profile')
    }
  }

  if (venue) {
    const venueIdentifier = typeof venue === 'object' ? (venue.new_hall_name || venue.old_hall_name || venue.id) : venue
    params.set('book', venueIdentifier)
  }

  if (tab === 'venues' && type && type !== 'All Spaces') {
    params.set('type', type)
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  const targetUrl = `${basePath}${query}`
  const currentUrl = `${window.location.pathname}${window.location.search}`

  if (targetUrl !== currentUrl) {
    const historyState = { activeTab: tab, venue, isProfile, type }
    if (replace) {
      window.history.replaceState(historyState, '', targetUrl)
    } else {
      window.history.pushState(historyState, '', targetUrl)
    }
  }
}
