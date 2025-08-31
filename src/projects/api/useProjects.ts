import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api/axios";
import { ProjectsSchema, type Project } from "./types";

async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects");
  return ProjectsSchema.parse(data); // ✅ geleni normalize eder
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
}
