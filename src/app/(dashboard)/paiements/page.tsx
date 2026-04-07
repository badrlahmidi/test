"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

interface Payment {
  id: string;
  invoice: { id: string; number: string; total: number };
  amount: number;
  method: string;
  reference: string | null;
  paidAt: string;
}

const methodLabel: Record<string, string> = {
  CASH: "Espèces",
  CHECK: "Chèque",
  TRANSFER: "Virement",
  CARD: "Carte",
  MOBILE_MONEY: "Mobile Money",
  OTHER: "Autre",
};

const columns: ColumnDef<Payment, unknown>[] = [
  { accessorKey: "invoice.number", header: "Facture" },
  {
    accessorKey: "amount",
    header: "Montant",
    cell: ({ row }) => formatCurrency(Number(row.original.amount)),
  },
  {
    accessorKey: "method",
    header: "Méthode",
    cell: ({ row }) => (
      <Badge>{methodLabel[row.original.method] ?? row.original.method}</Badge>
    ),
  },
  {
    accessorKey: "reference",
    header: "Référence",
    cell: ({ row }) => row.original.reference || "—",
  },
  {
    accessorKey: "paidAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.paidAt),
  },
];

export default function PaiementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["paiements"],
    queryFn: async () => {
      const res = await fetch("/api/v1/paiements?pageSize=50");
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
      </div>
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />
    </div>
  );
}
