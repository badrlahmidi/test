import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentMethod } from "@prisma/client";

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: { id: string; number: string; total: number };
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  createdAt: string;
}

interface PaymentsResponse {
  data: Payment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt: string;
}

async function fetchPayments(params: { page?: number; pageSize?: number } = {}): Promise<PaymentsResponse> {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/v1/paiements?${sp}`);
  if (!res.ok) throw new Error("Erreur chargement paiements");
  return res.json();
}

async function createPayment(data: PaymentInput): Promise<Payment> {
  const res = await fetch("/api/v1/paiements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur enregistrement paiement");
  }
  return res.json();
}

async function deletePayment(id: string): Promise<void> {
  const res = await fetch(`/api/v1/paiements/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression paiement");
}

export function usePayments(params: { page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => fetchPayments(params),
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
