import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QuoteStatus } from "@prisma/client";

export interface QuoteItem {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  client?: { id: string; name: string };
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  subtotal: number;
  tvaAmount: number;
  total: number;
  notes: string | null;
  convertedToInvoiceId: string | null;
  items?: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

interface QuotesResponse {
  data: Quote[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface QuoteInput {
  clientId: string;
  issueDate: string;
  validUntil: string;
  notes?: string;
  items: Array<{ productId?: string; description: string; quantity: number; unitPrice: number; tvaRate?: number }>;
}

async function fetchQuotes(params: { page?: number; pageSize?: number } = {}): Promise<QuotesResponse> {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/v1/devis?${sp}`);
  if (!res.ok) throw new Error("Erreur chargement devis");
  return res.json();
}

async function fetchQuote(id: string): Promise<Quote> {
  const res = await fetch(`/api/v1/devis/${id}`);
  if (!res.ok) throw new Error("Erreur chargement devis");
  return res.json();
}

async function createQuote(data: QuoteInput): Promise<Quote> {
  const res = await fetch("/api/v1/devis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur création devis");
  }
  return res.json();
}

async function updateQuote(id: string, data: Partial<QuoteInput> & { status?: QuoteStatus }): Promise<Quote> {
  const res = await fetch(`/api/v1/devis/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur mise à jour devis");
  }
  return res.json();
}

async function deleteQuote(id: string): Promise<void> {
  const res = await fetch(`/api/v1/devis/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression devis");
}

async function convertQuote(id: string): Promise<{ id: string; number: string }> {
  const res = await fetch(`/api/v1/devis/${id}/convert`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur conversion devis");
  }
  return res.json();
}

export function useQuotes(params: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ["quotes", params],
    queryFn: () => fetchQuotes(params),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: () => fetchQuote(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useUpdateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuoteInput> & { status?: QuoteStatus } }) =>
      updateQuote(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", id] });
    },
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useConvertQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: convertQuote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
