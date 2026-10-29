import { Router } from 'express'
import {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} from '../controllers/venueController.js'

const router = Router()

router.get('/', getAllVenues)
router.get('/:id', getVenueById)
router.post('/', createVenue)
router.put('/:id', updateVenue)
router.delete('/:id', deleteVenue)

export default router
