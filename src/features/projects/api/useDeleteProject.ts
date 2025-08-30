import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
