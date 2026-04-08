"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, DataTable, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface Quote {
  id: string;
  number: string;
  client: { id: string; name: string };
  issueDate: string;
  validUntil: string;
  status: string;
  total: number;
}

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
  CONVERTED: "Converti",
};

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  DRAFT: "default",
  SENT: "primary",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "warning",
  CONVERTED: "success",
};

const columns: ColumnDef<Quote, unknown>[] = [
  { accessorKey: "number", header: "N°" },
  { accessorKey: "client.name", header: "Client" },
  { accessorKey: "issueDate", header: "Date", cell: ({ row }) => formatDate(row.original.issueDate) },
  { accessorKey: "validUntil", header: "Valide jusqu'au", cell: ({ row }) => formatDate(row.original.validUntil) },
  { accessorKey: "total", header: "Total TTC", cell: ({ row }) => formatCurrency(Number(row.original.total)) },
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

export default function DevisPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const res = await fetch("/api/v1/devis?pageSize=50");
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/devis/nouveau")}>
          Nouveau devis
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/devis/${row.id}`)}
      />
    </div>
  );
}
