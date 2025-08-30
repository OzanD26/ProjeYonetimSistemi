import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import { ProjectSchema } from "./types";

type CreateInput = {
  name: string;
  description?: string;
  status?: "active" | "paused" | "archived";
};

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInput) => {
      const { data } = await api.post("/projects", {
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return ProjectSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
