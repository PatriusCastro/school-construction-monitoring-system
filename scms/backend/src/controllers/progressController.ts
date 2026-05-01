import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// GET all progress records joined with school name
export const getAllProgress = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      *,
      schools (
        id,
        school_name,
        municipality,
        sdo_priority_level,
        auto_generated_scope
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

// GET progress by school ID
export const getProgressBySchool = async (req: Request, res: Response) => {
  const { schoolId } = req.params

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('school_id', schoolId)
    .single()

  if (error) return res.status(404).json({ error: 'Progress record not found' })
  return res.json(data)
}

// POST create progress record
export const createProgress = async (req: Request, res: Response) => {
  const { school_id, construction_pct, materials_pct, status, start_date, target_date } = req.body

  if (!school_id) return res.status(400).json({ error: 'school_id is required' })

  const { data, error } = await supabase
    .from('progress')
    .insert([{ school_id, construction_pct, materials_pct, status, start_date, target_date }])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

// PUT update progress by school ID
export const updateProgress = async (req: Request, res: Response) => {
  const { schoolId } = req.params
  const { construction_pct, materials_pct, status, start_date, target_date } = req.body

  const { data, error } = await supabase
    .from('progress')
    .update({
      construction_pct,
      materials_pct,
      status,
      start_date,
      target_date,
      updated_at: new Date().toISOString(),
    })
    .eq('school_id', schoolId)
    .select()

  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) return res.status(404).json({ error: 'Progress record not found' })
  return res.json(data)
}