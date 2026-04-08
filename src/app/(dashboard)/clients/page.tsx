"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, DataTable, Input, Badge } from "@/components/ui";
import { Plus, Search } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  type: "COMPANY" | "INDIVIDUAL";
}

const columns: ColumnDef<Client, unknown>[] = [
  { accessorKey: "name", header: "Nom" },
  { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || "—" },
  { accessorKey: "phone", header: "Téléphone", cell: ({ row }) => row.original.phone || "—" },
  { accessorKey: "city", header: "Ville", cell: ({ row }) => row.original.city || "—" },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "COMPANY" ? "primary" : "default"}>
        {row.original.type === "COMPANY" ? "Entreprise" : "Particulier"}
      </Badge>
    ),
  },
];

export default function ClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["clients", search],
    queryFn: async () => {
      const params = new URLSearchParams({ search, pageSize: "50" });
      const res = await fetch(`/api/v1/clients?${params}`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/clients/nouveau")}
        >
          Nouveau client
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          label="Rechercher"
          placeholder="Nom, email, ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftAddon={<Search className="h-4 w-4" />}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/clients/${row.id}`)}
      />
    </div>
  );
}
