// src/features/tasks/api/types.ts
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: string;
  dueDate?: string;     // ISO
  createdAt: string;    // ISO
  updatedAt: string;    // ISO
  position: number;  
};
