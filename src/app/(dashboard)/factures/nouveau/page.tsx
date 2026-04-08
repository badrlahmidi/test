"use client";

import { useRouter } from "next/navigation";
import { useCreateInvoice } from "@/lib/hooks/use-invoices";
import { useClients } from "@/lib/hooks/use-clients";
import { useProducts } from "@/lib/hooks/use-products";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft } from "lucide-react";
import type { InvoiceFormData } from "@/lib/validations/invoice";

export default function NouvelleFacturePage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const { data: clientsData } = useClients({ pageSize: 200 });
  const { data: productsData } = useProducts({ pageSize: 200 });
  const createInvoice = useCreateInvoice();

  async function handleSubmit(data: InvoiceFormData) {
    try {
      await createInvoice.mutateAsync(data);
      addToast({ variant: "success", title: "Facture créée avec succès" });
      router.push("/factures");
    } catch (err) {
      addToast({
        variant: "error",
        title: err instanceof Error ? err.message : "Erreur lors de la création",
      });
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Retour">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle facture</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm
            clients={clientsData?.data ?? []}
            products={productsData?.data ?? []}
            onSubmit={handleSubmit}
            isLoading={createInvoice.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

