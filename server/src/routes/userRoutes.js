import { Router } from 'express'
import {
  getAllUsers,
  createUser,
  bulkImportUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from '../controllers/userController.js'

const router = Router()

router.get('/', getAllUsers)
router.post('/', createUser)
router.post('/import', bulkImportUsers)
router.patch('/:id/role', updateUserRole)
router.patch('/:id/status', updateUserStatus)
router.delete('/:id', deleteUser)

export default router
