import { z } from "zod";

export const taskStatuses = ["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
export const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

export const taskStatusLabels: Record<string, string> = {
  PENDING: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

export const taskPriorityLabels: Record<string, string> = {
  LOW: "Faible",
  MEDIUM: "Normale",
  HIGH: "Haute",
};

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  status: z.enum(taskStatuses).default("PENDING"),
  priority: z.enum(taskPriorities).default("MEDIUM"),
  dueDate: z.string().optional().or(z.literal("")),
  linkedEntityType: z.string().optional().or(z.literal("")),
  linkedEntityId: z.string().optional().or(z.literal("")),
});

export const taskUpdateSchema = taskSchema.partial();

export type TaskFormData = z.infer<typeof taskSchema>;
