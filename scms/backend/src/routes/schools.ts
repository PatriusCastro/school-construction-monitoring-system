import { Router } from 'express'
import { getSchools, addSchool } from '../controllers/schoolController'

const router = Router()

router.get('/', getSchools)
router.post('/', addSchool)

export default router