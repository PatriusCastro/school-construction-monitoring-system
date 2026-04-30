import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// GET all schools
export const getSchools = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

// POST add new school
export const addSchool = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('schools')
    .insert([req.body])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}