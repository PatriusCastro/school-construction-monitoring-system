import { Router } from 'express'
import { getReportSummary } from '../controllers/reportController'

const router = Router()

router.get('/summary', getReportSummary)

export default router