import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// GET full report summary
export const getReportSummary = async (req: Request, res: Response) => {
  const { data: schools, error } = await supabase
    .from('schools')
    .select('*')
    .order('ranking', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  const summary = {
    total_schools: schools.length,
    total_classrooms: schools.reduce((s, x) => s + (x.proposed_classrooms || 0), 0),
    total_units: schools.reduce((s, x) => s + (x.number_of_units || 0), 0),
    total_budget_allocated: schools.reduce((s, x) => s + (x.budget_allocated_php || 0), 0),
    total_budget_utilized: schools.reduce((s, x) => s + (x.budget_utilized_php || 0), 0),
    by_priority: {
      High: schools.filter(x => x.sdo_priority_level === 'High').length,
      Medium: schools.filter(x => x.sdo_priority_level === 'Medium').length,
      Low: schools.filter(x => x.sdo_priority_level === 'Low').length,
    },
    by_funding_year: schools.reduce((acc: Record<string, number>, x) => {
      if (x.funding_year) {
        acc[x.funding_year] = (acc[x.funding_year] || 0) + 1
      }
      return acc
    }, {}),
    schools,
  }

  return res.json(summary)
}