import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.union([
    z.enum(["active", "paused", "archived"]),
    z.number(),
    z.string(),
  ]).transform((v) => {
    const s = String(v);
    if (s === "0") return "active";
    if (s === "1") return "paused";
    if (s === "2") return "archived";
    return s as "active" | "paused" | "archived";
  }),
  createdAt: z.union([z.string(), z.number()]).transform((v) =>
    typeof v === "number" ? new Date(v).toISOString() : v
  ),
  updatedAt: z.union([z.string(), z.number()]).transform((v) =>
    typeof v === "number" ? new Date(v).toISOString() : v
  ),
});
export const ProjectsSchema = z.array(ProjectSchema);
export type Project = z.infer<typeof ProjectSchema>;
