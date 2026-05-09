import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// Whitelist only valid columns to prevent injection of unknown fields
const sanitizeSchool = (body: Record<string, unknown>) => {
  const allowed = [
    'school_id', 'school_name', 'municipality', 'legislative_district',
    'number_of_sites', 'existing_classrooms', 'proposed_classrooms',
    'number_of_units', 'stories', 'auto_generated_scope', 'workshop_type',
    'design_configuration', 'old_scope', 'funding_year', 'sdo_priority_level',
    'ranking', 'construction_progress_pct', 'materials_delivered_pct',
    'budget_allocated_php', 'budget_utilized_php', 'completion_date',
    'latitude', 'longitude', 'site_map_url',
  ]
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key))
  )
}

// GET all schools
export const getSchools = async (req: Request, res: Response) => {
  const { priority, funding_year, search } = req.query

  let query = supabase.from('schools').select('*').order('created_at', { ascending: false })

  if (priority) query = query.eq('sdo_priority_level', priority)
  if (funding_year) query = query.eq('funding_year', funding_year)
  if (search) query = query.ilike('school_name', `%${search}%`)

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })
  return res.json(data)
}

// GET single school by ID
export const getSchoolById = async (req: Request, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ error: 'School not found' })
  return res.json(data)
}

// POST add new school
export const addSchool = async (req: Request, res: Response) => {
  const payload = sanitizeSchool(req.body)

  // Required field check
  if (!payload.school_name) {
    return res.status(400).json({ error: 'school_name is required' })
  }

  // Auto-generate scope if not provided
  if (!payload.auto_generated_scope && payload.stories && payload.proposed_classrooms) {
    payload.auto_generated_scope = `${payload.stories}STY${payload.proposed_classrooms}CL`
  }

  const { data, error } = await supabase
    .from('schools')
    .insert([payload])
    .select()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

// PUT update school
export const updateSchool = async (req: Request, res: Response) => {
  const { id } = req.params
  const payload = sanitizeSchool(req.body)

  // Re-generate scope if stories or classrooms changed
  if (payload.stories && payload.proposed_classrooms) {
    payload.auto_generated_scope = `${payload.stories}STY${payload.proposed_classrooms}CL`
  }

  const { data, error } = await supabase
    .from('schools')
    .update(payload)
    .eq('id', id)
    .select()

  if (error) return res.status(500).json({ error: error.message })
  if (!data || data.length === 0) return res.status(404).json({ error: 'School not found' })
  return res.json(data)
}

// DELETE school
export const deleteSchool = async (req: Request, res: Response) => {
  const { id } = req.params

  const { error } = await supabase
    .from('schools')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ message: 'School deleted successfully' })
}

// GET dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('schools')
    .select('sdo_priority_level, funding_year, proposed_classrooms, number_of_units')

  if (error) return res.status(500).json({ error: error.message })

  const stats = {
    total_schools: data.length,
    total_classrooms: data.reduce((sum, s) => sum + (s.proposed_classrooms || 0), 0),
    total_units: data.reduce((sum, s) => sum + (s.number_of_units || 0), 0),
    high_priority: data.filter(s => s.sdo_priority_level === 'High').length,
    medium_priority: data.filter(s => s.sdo_priority_level === 'Medium').length,
    low_priority: data.filter(s => s.sdo_priority_level === 'Low').length,
    funding_years: [...new Set(data.map(s => s.funding_year).filter(Boolean))].sort(),
  }

  return res.json(stats)
}

export const uploadSiteMap = async (req: Request, res: Response) => {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const file = req.file
  const fileExt = file.originalname.split('.').pop()
  const fileName = `school-${id}-${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('site-maps')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    })

  if (uploadError) return res.status(500).json({ error: uploadError.message })

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('site-maps')
    .getPublicUrl(fileName)

  const site_map_url = urlData.publicUrl

  // Save URL to school record
  const { data, error } = await supabase
    .from('schools')
    .update({ site_map_url })
    .eq('id', id)
    .select()

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ site_map_url, school: data[0] })
}

// DELETE site map photo
export const deleteSiteMap = async (req: Request, res: Response) => {
  const { id } = req.params

  // Get current URL to extract filename
  const { data: school } = await supabase
    .from('schools')
    .select('site_map_url')
    .eq('id', id)
    .single()

  if (school?.site_map_url) {
    const fileName = school.site_map_url.split('/').pop()
    if (fileName) {
      await supabase.storage.from('site-maps').remove([fileName])
    }
  }

  const { error } = await supabase
    .from('schools')
    .update({ site_map_url: null })
    .eq('id', id)

  if (error) return res.status(500).json({ error: error.message })
  return res.json({ message: 'Site map removed' })
}