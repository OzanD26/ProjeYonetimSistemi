import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import type { Task } from "./types";


type CreateInput = Omit<Task, "id" | "createdAt" | "updatedAt">;

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInput) => {
      const payload1=Object.values(payload).map((x)=>x.toString().trim())
     console.log(payload1)
      const now = new Date().toISOString();
      const { data } = await api.post<Task>("/tasks", {
        ...payload,
        createdAt: now,
        updatedAt: now,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
