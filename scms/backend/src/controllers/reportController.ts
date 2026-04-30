import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

async function readTable(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    return [];
  }
  return data || [];
}

export const getReports = async (_req: Request, res: Response) => {
  const [schools, progress, constructionData, planningParameters, funding] = await Promise.all([
    readTable("schools"),
    readTable("progress_updates"),
    readTable("construction_data"),
    readTable("planning_parameters"),
    readTable("funding"),
  ]);

  const statusSummary = schools.reduce<Record<string, number>>((acc, school: any) => {
    const status = school.project_status || "Planned";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const averageProgress = progress.length
    ? Math.round(
        progress.reduce((total: any, entry: any) => total + Number(entry.construction_progress || 0), 0) / progress.length,
      )
    : 0;

  return res.json({
    schools,
    progress,
    constructionData,
    planningParameters,
    funding,
    statusSummary,
    averageProgress,
    generatedAt: new Date().toISOString(),
  });
};
