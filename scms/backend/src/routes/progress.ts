import { Router } from 'express'
import {
  getAllProgress,
  getProgressBySchool,
  createProgress,
  updateProgress,
} from '../controllers/progressController'

const router = Router()

router.get('/', getAllProgress)
router.get('/:schoolId', getProgressBySchool)
router.post('/', createProgress)
router.put('/:schoolId', updateProgress)

export default router