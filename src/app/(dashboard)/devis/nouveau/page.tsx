"use client";

import { useRouter } from "next/navigation";
import { useCreateQuote } from "@/lib/hooks/use-quotes";
import { useClients } from "@/lib/hooks/use-clients";
import { useProducts } from "@/lib/hooks/use-products";
import { QuoteForm } from "@/components/forms/quote-form";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft } from "lucide-react";
import type { QuoteFormData } from "@/lib/validations/quote";

export default function NouveauDevisPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const { data: clientsData } = useClients({ pageSize: 200 });
  const { data: productsData } = useProducts({ pageSize: 200 });
  const createQuote = useCreateQuote();

  async function handleSubmit(data: QuoteFormData) {
    try {
      await createQuote.mutateAsync(data);
      addToast({ variant: "success", title: "Devis créé avec succès" });
      router.push("/devis");
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
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du devis</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteForm
            clients={clientsData?.data ?? []}
            products={productsData?.data ?? []}
            onSubmit={handleSubmit}
            isLoading={createQuote.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

