import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InvoiceStatus } from "@prisma/client";

export interface InvoiceItem {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client?: { id: string; name: string; email?: string | null; phone?: string | null; address?: string | null; city?: string | null; ice?: string | null };
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  tvaAmount: number;
  total: number;
  notes: string | null;
  items?: InvoiceItem[];
  payments?: Array<{ id: string; amount: number; method: string; paidAt: string; reference: string | null }>;
  createdAt: string;
  updatedAt: string;
}

interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

interface InvoiceInput {
  clientId: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  items: Array<{ productId?: string; description: string; quantity: number; unitPrice: number; tvaRate?: number }>;
}

async function fetchInvoices(params: ListParams = {}): Promise<InvoicesResponse> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/v1/factures?${sp}`);
  if (!res.ok) throw new Error("Erreur chargement factures");
  return res.json();
}

async function fetchInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`/api/v1/factures/${id}`);
  if (!res.ok) throw new Error("Erreur chargement facture");
  return res.json();
}

async function createInvoice(data: InvoiceInput): Promise<Invoice> {
  const res = await fetch("/api/v1/factures", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur création facture");
  }
  return res.json();
}

async function updateInvoice(id: string, data: Partial<InvoiceInput> & { status?: InvoiceStatus }): Promise<Invoice> {
  const res = await fetch(`/api/v1/factures/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur mise à jour facture");
  }
  return res.json();
}

async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`/api/v1/factures/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression facture");
}

async function duplicateInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`/api/v1/factures/${id}/duplicate`, { method: "POST" });
  if (!res.ok) throw new Error("Erreur duplication facture");
  return res.json();
}

export function useInvoices(params: ListParams = {}) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => fetchInvoices(params),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceInput> & { status?: InvoiceStatus } }) =>
      updateInvoice(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDuplicateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: duplicateInvoice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
