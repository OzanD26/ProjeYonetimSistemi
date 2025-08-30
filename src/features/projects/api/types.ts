import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  status: z.enum(["active", "paused", "archived"]).default("active"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;
