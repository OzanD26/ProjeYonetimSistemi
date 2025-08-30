import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import { ProjectSchema } from "./types";
import { z } from "zod";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get("/projects");
      return z.array(ProjectSchema).parse(data);
    },
  });
}
