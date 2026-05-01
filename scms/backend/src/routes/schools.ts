import { Router } from 'express'
import {
  getSchools,
  getSchoolById,
  addSchool,
  updateSchool,
  deleteSchool,
  getDashboardStats,
} from '../controllers/schoolController'

const router = Router()

router.get('/stats', getDashboardStats)   // ← must be before /:id
router.get('/', getSchools)
router.get('/:id', getSchoolById)
router.post('/', addSchool)
router.put('/:id', updateSchool)
router.delete('/:id', deleteSchool)

export default router