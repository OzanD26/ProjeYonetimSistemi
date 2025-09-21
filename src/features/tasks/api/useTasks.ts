import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import type { Task } from "./types";

type Params = {
  projectId?: string;
  status?: string;
};

// Tüm task'ları çeker (parametreleri API'ye göndermiyoruz)
async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/tasks");
  return data;
}

// küçük normalizasyon helper'ı
function norm(v: unknown) {
  return String(v ?? "").toLowerCase().replace(/\s+/g, "_");
}

export function useTasks(params?: Params) {
  return useQuery({
    queryKey: ["tasks", params],      // params değişirse cache ayrışsın
    queryFn: () => fetchTasks(),      // API'ye parametre YOK
    // Client-side filter
    select: (all) => {
      let list = all;
      if (params?.status) {
        const want = norm(params.status);
        list = list.filter((t) => norm(t.status) === want);
      }
      if (params?.projectId) {
        list = list.filter((t) => String(t.projectId) === String(params.projectId));
      }
      return list;
    },
  });
}
