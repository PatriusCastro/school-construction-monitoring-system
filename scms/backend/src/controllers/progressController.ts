import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

export const getProgress = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("progress_updates").select("*");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
};

export const addProgressUpdate = async (req: Request, res: Response) => {
  const payload = {
    school_id: req.body.school_id,
    construction_progress: req.body.construction_progress,
    materials_delivered: req.body.materials_delivered,
    completion_date: req.body.completion_date,
    notes: req.body.notes || null,
  };

  const { data, error } = await supabase
    .from("progress_updates")
    .insert([payload])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data || []);
};
