import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api/axios";
import type { Task } from "./types";

type UpdateInput = {
  id: string;
  data: Partial<
    Pick<
      Task,
      "title" | "description" | "status" | "assignee" | "dueDate" | "projectId" | "position"
    >
  >;
};

const TASKS_KEY = ["tasks"] as const;
const taskKey = (id: string) => [...TASKS_KEY, id] as const;

type Ctx = {
  prevList?: Task[];
  prevItem?: Task;
};

export function useUpdateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateInput) => {
      const payload = { ...data, updatedAt: new Date().toISOString() };
      const { data: res } = await api.put<Task>(`/tasks/${id}`, payload);
      return res;
    },

    onMutate: async ({ id, data }): Promise<Ctx> => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      await qc.cancelQueries({ queryKey: taskKey(id) });

      const prevList = qc.getQueryData<Task[]>(TASKS_KEY);
      const prevItem = qc.getQueryData<Task>(taskKey(id));

      if (prevList) {
        qc.setQueryData<Task[]>(
          TASKS_KEY,
          prevList.map((t) => (t.id === id ? { ...t, ...data } : t))
        );
      }
      if (prevItem) {
        qc.setQueryData<Task>(taskKey(id), { ...prevItem, ...data });
      }

      return { prevList, prevItem };
    },

    onError: (_err, { id }, ctx) => {
      if (ctx?.prevList) qc.setQueryData(TASKS_KEY, ctx.prevList);
      if (ctx?.prevItem) qc.setQueryData(taskKey(id), ctx.prevItem);
    },

    onSuccess: (serverTask, { id }) => {
      qc.setQueryData<Task>(taskKey(id), serverTask);
      const list = qc.getQueryData<Task[]>(TASKS_KEY);
      if (list) {
        qc.setQueryData<Task[]>(
          TASKS_KEY,
          list.map((t) => (t.id === id ? serverTask : t))
        );
      }
    },

    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      qc.invalidateQueries({ queryKey: taskKey(id) });
    },
  });
}
