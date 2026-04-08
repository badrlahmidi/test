"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useExpenses,
  useCreateExpense,
  useDeleteExpense,
  type Expense,
} from "@/lib/hooks/use-expenses";
import {
  expenseSchema,
  expenseCategories,
  expenseCategoryLabels,
  type ExpenseFormData,
} from "@/lib/validations/expense";
import { Button, Input, Select, Modal, Badge, DataTable, SkeletonCard } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import { Plus, Search, Trash2, TrendingDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

const categoryOptions = expenseCategories.map((c) => ({
  value: c,
  label: expenseCategoryLabels[c] ?? c,
}));

const categoryColors: Record<string, string> = {
  ACHAT_MATERIEL: "primary",
  LOYER: "warning",
  SALAIRES: "danger",
  TRANSPORT: "default",
  COMMUNICATION: "default",
  SOUS_TRAITANCE: "warning",
  FOURNITURES: "default",
  MARKETING: "primary",
  TAXES: "danger",
  AUTRE: "default",
};

function ExpenseForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "AUTRE",
      expenseDate: new Date().toISOString().slice(0, 10),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Libellé *"
        placeholder="Ex: Achat ordinateur portable"
        error={errors.title?.message}
        {...register("title")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Montant (MAD) *"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount")}
        />
        <Input
          label="Date *"
          type="date"
          error={errors.expenseDate?.message}
          {...register("expenseDate")}
        />
      </div>

      <Select
        label="Catégorie"
        options={categoryOptions}
        error={errors.category?.message}
        {...register("category")}
      />

      <Input
        label="Référence / N° pièce"
        placeholder="Ex: FACT-2024-001"
        error={errors.reference?.message}
        {...register("reference")}
      />

      <div className="w-full">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          rows={3}
          placeholder="Détails supplémentaires..."
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

export default function DepensesPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const { data, isLoading } = useExpenses({ search, category: categoryFilter, pageSize: 50 });
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const totalFiltered = data?.data.reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  async function handleCreate(formData: ExpenseFormData) {
    try {
      await createExpense.mutateAsync({
        ...formData,
        description: formData.description || null,
        reference: formData.reference || null,
        amount: Number(formData.amount),
      } as Omit<Expense, "id" | "createdAt" | "updatedAt">);
      addToast({ variant: "success", title: "Dépense enregistrée" });
      setCreateOpen(false);
    } catch {
      addToast({ variant: "error", title: "Erreur lors de l'enregistrement" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteExpense.mutateAsync(deleteTarget.id);
      addToast({ variant: "success", title: "Dépense supprimée" });
      setDeleteTarget(null);
    } catch {
      addToast({ variant: "error", title: "Erreur lors de la suppression" });
    }
  }

  const columns: ColumnDef<Expense, unknown>[] = [
    {
      accessorKey: "expenseDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.expenseDate),
    },
    { accessorKey: "title", header: "Libellé" },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }) => (
        <Badge variant={(categoryColors[row.original.category] ?? "default") as "default" | "primary" | "success" | "warning" | "danger"}>
          {expenseCategoryLabels[row.original.category] ?? row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "reference",
      header: "Référence",
      cell: ({ row }) => row.original.reference || "—",
    },
    {
      accessorKey: "amount",
      header: "Montant",
      cell: ({ row }) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(Number(row.original.amount))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          aria-label="Supprimer"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row.original);
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dépenses</h1>
          {!isLoading && data && (
            <p className="mt-1 text-sm text-gray-500">
              <TrendingDown className="mr-1 inline h-4 w-4 text-red-500" />
              Total affiché :{" "}
              <span className="font-semibold text-red-600">
                {formatCurrency(totalFiltered)}
              </span>
            </p>
          )}
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Nouvelle dépense
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <Input
            label="Rechercher"
            placeholder="Libellé, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftAddon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="w-52">
          <Select
            label="Catégorie"
            options={[{ value: "", label: "Toutes les catégories" }, ...categoryOptions]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : (
        <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouvelle dépense"
        size="md"
      >
        <ExpenseForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isLoading={createExpense.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la dépense"
      >
        <p className="mb-4 text-gray-600">
          Êtes-vous sûr de vouloir supprimer{" "}
          <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong> ?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleteExpense.isPending}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
