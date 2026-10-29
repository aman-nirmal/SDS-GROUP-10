import { Router } from 'express'
import {
  getAllRoleRequests,
  createRoleRequest,
  updateRoleRequestStatus
} from '../controllers/roleRequestController.js'

const router = Router()

router.get('/', getAllRoleRequests)
router.post('/', createRoleRequest)
router.patch('/:id', updateRoleRequestStatus)

export default router
