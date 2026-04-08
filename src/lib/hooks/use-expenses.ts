import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExpenseCategory } from "@prisma/client";

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: ExpenseCategory;
  reference: string | null;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpensesResponse {
  data: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListParams {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

async function fetchExpenses(params: ListParams = {}): Promise<ExpensesResponse> {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.category) sp.set("category", params.category);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/v1/depenses?${sp}`);
  if (!res.ok) throw new Error("Erreur chargement dépenses");
  return res.json();
}

async function createExpense(data: Omit<Expense, "id" | "createdAt" | "updatedAt">): Promise<Expense> {
  const res = await fetch("/api/v1/depenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur création dépense");
  }
  return res.json();
}

async function updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`/api/v1/depenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur mise à jour dépense");
  }
  return res.json();
}

async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/v1/depenses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression dépense");
}

export function useExpenses(params: ListParams = {}) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => fetchExpenses(params),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSettled: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      updateExpense(id, data),
    onSettled: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSettled: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
