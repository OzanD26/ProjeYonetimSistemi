import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),

  name: z.string().min(1),

  description: z.string().optional().default(""),

  status: z
    .union([z.enum(["active", "paused", "archived"]), z.string()])
    .transform((v) => {
      if (v === "active" || v === "paused" || v === "archived") return v;
      return "active"; // fallback
    })
    .default("active"),

  createdAt: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) =>
      v ? (typeof v === "number" ? new Date(v).toISOString() : v) : undefined
    ),

  updatedAt: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) =>
      v ? (typeof v === "number" ? new Date(v).toISOString() : v) : undefined
    ),
});

export type Project = z.infer<typeof ProjectSchema>;
