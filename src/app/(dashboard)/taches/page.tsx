"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  type Task,
} from "@/lib/hooks/use-tasks";
import {
  taskSchema,
  taskStatuses,
  taskStatusLabels,
  taskPriorities,
  taskPriorityLabels,
  type TaskFormData,
} from "@/lib/validations/task";
import { Button, Input, Select, Modal, Badge, SkeletonCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import { Plus, Search, CheckCircle2, Circle, Trash2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const statusOptions = taskStatuses.map((s) => ({ value: s, label: taskStatusLabels[s] ?? s }));
const priorityOptions = taskPriorities.map((p) => ({ value: p, label: taskPriorityLabels[p] ?? p }));

const priorityColor: Record<string, string> = {
  LOW: "default",
  MEDIUM: "primary",
  HIGH: "danger",
};

const statusIcon: Record<string, string> = {
  PENDING: "text-gray-400",
  IN_PROGRESS: "text-blue-500",
  DONE: "text-green-500",
  CANCELLED: "text-gray-300",
};

function TaskForm({
  onSubmit,
  onCancel,
  isLoading,
  defaultValues,
}: {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  defaultValues?: Partial<Task>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status ?? "PENDING",
      priority: defaultValues?.priority ?? "MEDIUM",
      dueDate: defaultValues?.dueDate ? new Date(defaultValues.dueDate).toISOString().slice(0, 10) : "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Titre *"
        placeholder="Ex: Relancer la facture FAC-2024-001"
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priorité"
          options={priorityOptions}
          error={errors.priority?.message}
          {...register("priority")}
        />
        <Select
          label="Statut"
          options={statusOptions}
          error={errors.status?.message}
          {...register("status")}
        />
      </div>

      <Input
        label="Échéance"
        type="date"
        error={errors.dueDate?.message}
        {...register("dueDate")}
      />

      <div className="w-full">
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          rows={3}
          placeholder="Détails de la tâche..."
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

export default function TachesPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const { data, isLoading } = useTasks({ search, status: statusFilter, priority: priorityFilter, pageSize: 50 });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = data?.data ?? [];
  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const doneToday = tasks.filter((t) => {
    if (t.status !== "DONE") return false;
    const updated = new Date(t.updatedAt);
    const today = new Date();
    return (
      updated.getDate() === today.getDate() &&
      updated.getMonth() === today.getMonth() &&
      updated.getFullYear() === today.getFullYear()
    );
  }).length;

  async function handleCreate(formData: TaskFormData) {
    try {
      await createTask.mutateAsync({
        ...formData,
        description: formData.description || null,
        dueDate: formData.dueDate || null,
      } as Partial<Task>);
      addToast({ variant: "success", title: "Tâche créée" });
      setCreateOpen(false);
    } catch {
      addToast({ variant: "error", title: "Erreur lors de la création" });
    }
  }

  async function handleUpdate(formData: TaskFormData) {
    if (!editTask) return;
    try {
      await updateTask.mutateAsync({
        id: editTask.id,
        data: {
          ...formData,
          description: formData.description || null,
          dueDate: formData.dueDate || null,
        } as Partial<Task>,
      });
      addToast({ variant: "success", title: "Tâche mise à jour" });
      setEditTask(null);
    } catch {
      addToast({ variant: "error", title: "Erreur lors de la mise à jour" });
    }
  }

  async function handleToggleDone(task: Task) {
    const newStatus = task.status === "DONE" ? "PENDING" : "DONE";
    try {
      await updateTask.mutateAsync({ id: task.id, data: { status: newStatus } });
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTask.mutateAsync(deleteTarget.id);
      addToast({ variant: "success", title: "Tâche supprimée" });
      setDeleteTarget(null);
    } catch {
      addToast({ variant: "error", title: "Erreur lors de la suppression" });
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches</h1>
          {!isLoading && (
            <p className="mt-1 text-sm text-gray-500">
              <ClipboardList className="mr-1 inline h-4 w-4 text-blue-500" />
              {pendingCount} à faire · {doneToday} terminées aujourd&apos;hui
            </p>
          )}
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Nouvelle tâche
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-60">
          <Input
            label="Rechercher"
            placeholder="Titre de tâche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftAddon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-44">
          <Select
            label="Statut"
            options={[{ value: "", label: "Tous les statuts" }, ...statusOptions]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            label="Priorité"
            options={[{ value: "", label: "Toutes" }, ...priorityOptions]}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="text-gray-500">Aucune tâche trouvée</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Créer une tâche
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isOverdue =
              task.dueDate &&
              task.status !== "DONE" &&
              task.status !== "CANCELLED" &&
              new Date(task.dueDate) < new Date();

            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm",
                  task.status === "DONE" && "opacity-60",
                )}
              >
                <button
                  onClick={() => handleToggleDone(task)}
                  className="flex-shrink-0"
                  aria-label={task.status === "DONE" ? "Marquer non terminée" : "Marquer terminée"}
                >
                  {task.status === "DONE" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className={cn("h-5 w-5", statusIcon[task.status])} />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <button
                    className="text-left"
                    onClick={() => setEditTask(task)}
                  >
                    <p className={cn("font-medium text-gray-900", task.status === "DONE" && "line-through text-gray-400")}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">{task.description}</p>
                    )}
                  </button>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                  <Badge variant={(priorityColor[task.priority] ?? "default") as "default" | "primary" | "success" | "warning" | "danger"}>
                    {taskPriorityLabels[task.priority]}
                  </Badge>

                  {task.dueDate && (
                    <span className={cn("text-xs", isOverdue ? "font-semibold text-red-600" : "text-gray-500")}>
                      {isOverdue ? "⚠ " : ""}{formatDate(task.dueDate)}
                    </span>
                  )}

                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {taskStatusLabels[task.status]}
                  </span>

                  <button
                    onClick={() => setDeleteTarget(task)}
                    aria-label="Supprimer"
                    className="text-gray-300 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle tâche">
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isLoading={createTask.isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Modifier la tâche">
        {editTask && (
          <TaskForm
            onSubmit={handleUpdate}
            onCancel={() => setEditTask(null)}
            isLoading={updateTask.isPending}
            defaultValues={editTask}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer la tâche">
        <p className="mb-4 text-gray-600">
          Supprimer <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong> ?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={deleteTask.isPending}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
