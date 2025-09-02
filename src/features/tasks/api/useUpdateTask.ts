import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import type { Task } from "./types";

type UpdateInput = {
  id: string;
  data: Partial<Pick<Task, "title" | "description" | "status" | "assignee" | "dueDate" | "projectId">>;
};

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateInput) => {
      const { data: res } = await api.put<Task>(`/tasks/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
