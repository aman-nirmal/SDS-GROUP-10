import { dataStore } from '../services/dataStore.js'

export async function getTimetable(req, res, next) {
  try {
    const timetable = await dataStore.getTimetable()
    return res.json({ success: true, count: timetable.length, timetable })
  } catch (err) {
    next(err)
  }
}

export async function createTimetableEntry(req, res, next) {
  try {
    const { venueName, title, courseCode, dayOfWeek, startTime, endTime, facultyName, department } = req.body
    if (!venueName || !title || !dayOfWeek) {
      return res.status(400).json({ success: false, error: 'venueName, title, and dayOfWeek are required.' })
    }
    const entry = await dataStore.createTimetableEntry(req.body)
    return res.status(201).json({ success: true, entry })
  } catch (err) {
    next(err)
  }
}

export async function bulkCreateTimetable(req, res, next) {
  try {
    const { entries } = req.body
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, error: 'Expected non-empty entries array.' })
    }
    const created = await dataStore.bulkCreateTimetable(entries)
    return res.status(201).json({ success: true, count: created.length, created })
  } catch (err) {
    next(err)
  }
}

export async function deleteTimetableEntry(req, res, next) {
  try {
    const deleted = await dataStore.deleteTimetableEntry(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found.' })
    }
    return res.json({ success: true, message: 'Timetable block removed.' })
  } catch (err) {
    next(err)
  }
}
