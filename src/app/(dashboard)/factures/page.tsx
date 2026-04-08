"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, DataTable, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface Invoice {
  id: string;
  number: string;
  client: { id: string; name: string };
  issueDate: string;
  dueDate: string;
  status: string;
  total: number;
}

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  DRAFT: "default",
  SENT: "primary",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  OVERDUE: "danger",
  CANCELLED: "default",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partielle",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
};

const columns: ColumnDef<Invoice, unknown>[] = [
  { accessorKey: "number", header: "N°" },
  { accessorKey: "client.name", header: "Client" },
  {
    accessorKey: "issueDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.issueDate),
  },
  {
    accessorKey: "dueDate",
    header: "Échéance",
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  {
    accessorKey: "total",
    header: "Total TTC",
    cell: ({ row }) => formatCurrency(Number(row.original.total)),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? "default"}>
        {statusLabel[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
];

export default function FacturesPage() {
  const router = useRouter();
  const [status] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["factures", status],
    queryFn: async () => {
      const params = new URLSearchParams({ pageSize: "50", ...(status && { status }) });
      const res = await fetch(`/api/v1/factures?${params}`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/factures/nouveau")}
        >
          Nouvelle facture
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/factures/${row.id}`)}
      />
    </div>
  );
}
