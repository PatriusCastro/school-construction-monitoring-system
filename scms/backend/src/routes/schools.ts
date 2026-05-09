console.log('schools router loaded')

import { Router } from 'express'
import multer from 'multer'
import {
  getSchools,
  getSchoolById,
  addSchool,
  updateSchool,
  deleteSchool,
  getDashboardStats,
  uploadSiteMap,
  deleteSiteMap,
} from '../controllers/schoolController'

const router = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/stats', getDashboardStats)

// ── Site-map routes MUST come before /:id routes ──
router.post('/:id/site-map', upload.single('file'), uploadSiteMap)
router.delete('/:id/site-map', deleteSiteMap)

// ── General CRUD ──
router.get('/', getSchools)
router.get('/:id', getSchoolById)
router.post('/', addSchool)
router.put('/:id', updateSchool)
router.delete('/:id', deleteSchool)

export default router