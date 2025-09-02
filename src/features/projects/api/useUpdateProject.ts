import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import type { Project } from "./types";

type UpdateInput = {
  id: string;
  data: Partial<Pick<Project, "name" | "description" | "status">>;
};

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateInput) => {
      const { data: res } = await api.put<Project>(`/projects/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return res;
    },
    // optimistic update
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["projects"] });
      const prev = qc.getQueryData<Project[]>(["projects"]);
      if (prev) {
        qc.setQueryData<Project[]>(
          ["projects"],
          prev.map((p) => (p.id === id ? { ...p, ...data } : p))
        );
      }
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["projects"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
