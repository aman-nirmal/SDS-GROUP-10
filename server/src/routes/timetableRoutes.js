import { Router } from 'express'
import {
  getTimetable,
  createTimetableEntry,
  bulkCreateTimetable,
  deleteTimetableEntry
} from '../controllers/timetableController.js'

const router = Router()

router.get('/', getTimetable)
router.post('/', createTimetableEntry)
router.post('/bulk', bulkCreateTimetable)
router.delete('/:id', deleteTimetableEntry)

export default router
