import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClientType } from "@prisma/client";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  ice: string | null;
  address: string | null;
  city: string | null;
  type: ClientType;
  createdAt: string;
  updatedAt: string;
}

interface ClientsResponse {
  data: Client[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ClientWithHistory extends Client {
  invoices: Array<{ id: string; number: string; status: string; total: number; issueDate: string; dueDate: string }>;
  quotes: Array<{ id: string; number: string; status: string; total: number; issueDate: string }>;
}

interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

async function fetchClients(params: ListParams = {}): Promise<ClientsResponse> {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/v1/clients?${sp}`);
  if (!res.ok) throw new Error("Erreur chargement clients");
  return res.json();
}

async function fetchClient(id: string): Promise<ClientWithHistory> {
  const res = await fetch(`/api/v1/clients/${id}`);
  if (!res.ok) throw new Error("Erreur chargement client");
  return res.json();
}

async function createClient(data: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  const res = await fetch("/api/v1/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur création client");
  }
  return res.json();
}

async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  const res = await fetch(`/api/v1/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur mise à jour client");
  }
  return res.json();
}

async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`/api/v1/clients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression client");
}

export function useClients(params: ListParams = {}) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => fetchClients(params),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      updateClient(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["clients", id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}
