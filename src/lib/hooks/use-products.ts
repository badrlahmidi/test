import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
  tvaRate: number;
  unit: string;
  sku: string | null;
  stockQty: number;
  minStockAlert: number;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

async function fetchProducts(params: ListParams = {}): Promise<ProductsResponse> {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/v1/produits?${sp}`);
  if (!res.ok) throw new Error("Erreur chargement produits");
  return res.json();
}

async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/v1/produits/${id}`);
  if (!res.ok) throw new Error("Erreur chargement produit");
  return res.json();
}

async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  const res = await fetch("/api/v1/produits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur création produit");
  }
  return res.json();
}

async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/v1/produits/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erreur mise à jour produit");
  }
  return res.json();
}

async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/v1/produits/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur suppression produit");
}

export function useProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products", id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
