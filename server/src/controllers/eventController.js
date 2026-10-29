import { dataStore } from '../services/dataStore.js'

export async function getEvents(req, res, next) {
  try {
    const events = await dataStore.getEvents()
    return res.json({ success: true, count: events.length, events })
  } catch (err) {
    next(err)
  }
}
