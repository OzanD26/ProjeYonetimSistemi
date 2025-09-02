import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import type { Task } from "./types";

type Params = {
  projectId?: string;    // filtrelemek için opsiyonel
  status?: string;
};

async function fetchTasks(params?: Params): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/tasks", { params });
  return data;
}

export function useTasks(params?: Params) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => fetchTasks(params),
  });
}
