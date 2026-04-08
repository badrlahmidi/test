import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskStatus, TaskPriority } from "@prisma/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  data: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListParams {
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
}

async function fetchTasks(params: ListParams = {}): Promise<TasksResponse> {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.status) sp.set("status", params.status);
  if (params.priority) sp.set("priority", params.priority);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/v1/taches?${sp}`);
  if (!res.ok) throw new Error("Erreur chargement tâches");
  return res.json();
}

async function createTask(data: Partial<Task>): Promise<Task> {
  const res = await fetch("/api/v1/taches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur création tâche");
  }
  return res.json();
}

async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const res = await fetch(`/api/v1/taches/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur mise à jour tâche");
  }
  return res.json();
}

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/v1/taches/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression tâche");
}

export function useTasks(params: ListParams = {}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => fetchTasks(params),
  });
}

export function usePendingTasksCount() {
  return useQuery({
    queryKey: ["tasks", { status: "PENDING", pageSize: 1 }],
    queryFn: async () => {
      const res = await fetch("/api/v1/taches?status=PENDING&pageSize=1");
      if (!res.ok) return 0;
      const json: TasksResponse = await res.json();
      return json.total;
    },
    staleTime: 60_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      updateTask(id, data),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
