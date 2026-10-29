import { dataStore } from '../services/dataStore.js'

export async function getAllVenues(req, res, next) {
  try {
    const { department, status, search } = req.query
    const venues = await dataStore.getVenues({ department, status, search })
    return res.json({ success: true, count: venues.length, venues })
  } catch (err) {
    next(err)
  }
}

export async function getVenueById(req, res, next) {
  try {
    const venue = await dataStore.getVenueById(req.params.id)
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' })
    }
    return res.json({ success: true, venue })
  } catch (err) {
    next(err)
  }
}

export async function createVenue(req, res, next) {
  try {
    const { name, department, category, capacity, status, features, description } = req.body
    if (!name) {
      return res.status(400).json({ success: false, error: 'Venue name is required.' })
    }
    const venue = await dataStore.createVenue({
      name,
      department,
      category,
      capacity,
      status,
      features,
      description
    })
    return res.status(201).json({ success: true, venue })
  } catch (err) {
    next(err)
  }
}

export async function updateVenue(req, res, next) {
  try {
    const venue = await dataStore.updateVenue(req.params.id, req.body)
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' })
    }
    return res.json({ success: true, venue })
  } catch (err) {
    next(err)
  }
}

export async function deleteVenue(req, res, next) {
  try {
    const deleted = await dataStore.deleteVenue(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Venue not found' })
    }
    return res.json({ success: true, message: 'Venue successfully removed' })
  } catch (err) {
    next(err)
  }
}
