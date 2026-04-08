"use client";

import { useState } from "react";
import { usePayments, useCreatePayment, useDeletePayment } from "@/lib/hooks/use-payments";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { PaymentForm } from "@/components/forms/payment-form";
import {
  Button,
  DataTable,
  Badge,
  Modal,
  SkeletonTable,
  Select,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import { Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Payment } from "@/lib/hooks/use-payments";
import type { PaymentFormData } from "@/lib/validations/payment";

const methodLabel: Record<string, string> = {
  CASH: "Espèces", CHECK: "Chèque", TRANSFER: "Virement",
  CARD: "Carte", MOBILE_MONEY: "Mobile Money", OTHER: "Autre",
};

export default function PaiementsPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [newOpen, setNewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = usePayments({ pageSize: 100 });
  const { data: invoicesData } = useInvoices({ status: "SENT", pageSize: 100 });
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();

  const invoiceOptions = [
    { value: "", label: "— Sélectionner une facture —" },
    ...(invoicesData?.data ?? []).map((inv) => ({
      value: inv.id,
      label: `${inv.number} — ${formatCurrency(Number(inv.total))}`,
    })),
  ];

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const selectedInvoice = invoicesData?.data?.find((i) => i.id === selectedInvoiceId);

  async function handleCreate(data: PaymentFormData) {
    try {
      await createPayment.mutateAsync(data);
      addToast({ variant: "success", title: "Paiement enregistré" });
      setNewOpen(false);
      setSelectedInvoiceId("");
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePayment.mutateAsync(id);
      addToast({ variant: "success", title: "Paiement supprimé" });
      setDeleteId(null);
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          className="rounded p-1 text-red-500 hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); setDeleteId(row.original.id); }}
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setNewOpen(true)}>
          Nouveau paiement
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <DataTable columns={columns} data={data?.data ?? []} />
      )}

      <Modal isOpen={newOpen} onClose={() => setNewOpen(false)} title="Enregistrer un paiement">
        <div className="mb-4">
          <Select
            label="Facture *"
            options={invoiceOptions}
            value={selectedInvoiceId}
            onChange={setSelectedInvoiceId}
          />
        </div>
        {selectedInvoiceId && (
          <PaymentForm
            invoiceId={selectedInvoiceId}
            maxAmount={selectedInvoice ? Number(selectedInvoice.total) : undefined}
            onSubmit={handleCreate}
            onCancel={() => setNewOpen(false)}
            isLoading={createPayment.isPending}
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer le paiement">
        <p className="mb-4 text-gray-600">Confirmer la suppression de ce paiement ?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button
            variant="destructive"
            onClick={() => deleteId && handleDelete(deleteId)}
            isLoading={deletePayment.isPending}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}

