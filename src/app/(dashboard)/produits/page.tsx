"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, DataTable, Input, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  stockQty: number;
  minStockAlert: number;
  unit: string;
  category: string | null;
  isActive: boolean;
}

const columns: ColumnDef<Product, unknown>[] = [
  { accessorKey: "name", header: "Nom" },
  {
    accessorKey: "unitPrice",
    header: "Prix unitaire",
    cell: ({ row }) => formatCurrency(Number(row.original.unitPrice)),
  },
  {
    accessorKey: "stockQty",
    header: "Stock",
    cell: ({ row }) => {
      const isLow = row.original.stockQty <= row.original.minStockAlert;
      return (
        <Badge variant={isLow ? "danger" : "success"}>
          {row.original.stockQty} {row.original.unit}
        </Badge>
      );
    },
  },
  { accessorKey: "category", header: "Catégorie", cell: ({ row }) => row.original.category || "—" },
  {
    accessorKey: "isActive",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "success" : "default"}>
        {row.original.isActive ? "Actif" : "Inactif"}
      </Badge>
    ),
  },
];

export default function ProduitsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["produits", search],
    queryFn: async () => {
      const params = new URLSearchParams({ search, pageSize: "50" });
      const res = await fetch(`/api/v1/produits?${params}`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/produits/nouveau")}
        >
          Nouveau produit
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          label="Rechercher"
          placeholder="Nom, SKU, catégorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftAddon={<Search className="h-4 w-4" />}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/produits/${row.id}`)}
      />
    </div>
  );
}
