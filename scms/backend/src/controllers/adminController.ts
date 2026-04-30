import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

export const uploadSitePlan = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileName = `site-plan-${Date.now()}-${file.originalname}`;
  const { error } = await supabase.storage.from("site-plans").upload(fileName, file.buffer, {
    contentType: file.mimetype,
    upsert: true,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const { data } = supabase.storage.from("site-plans").getPublicUrl(fileName);
  return res.status(201).json({ url: data?.publicUrl || "" });
};
