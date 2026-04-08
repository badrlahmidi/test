"use client";

import { useParams, useRouter } from "next/navigation";
import { useClient, useCreateClient, useUpdateClient } from "@/lib/hooks/use-clients";
import { ClientForm } from "@/components/forms/client-form";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  SkeletonCard,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft, FileText } from "lucide-react";
import type { ClientFormData } from "@/lib/validations/client";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  DRAFT: "default",
  SENT: "primary",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  OVERDUE: "danger",
  CANCELLED: "default",
};
const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon", SENT: "Envoyée", PAID: "Payée",
  PARTIALLY_PAID: "Partielle", OVERDUE: "En retard", CANCELLED: "Annulée",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const id = params.id as string;
  const isNew = id === "nouveau";

  const { data: client, isLoading } = useClient(isNew ? "" : id);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  async function handleSubmit(data: ClientFormData) {
    try {
      if (isNew) {
        await createClient.mutateAsync(data);
        addToast({ variant: "success", title: "Client créé avec succès" });
      } else {
        await updateClient.mutateAsync({ id, data });
        addToast({ variant: "success", title: "Client mis à jour" });
      }
      router.push("/clients");
    } catch {
      addToast({ variant: "error", title: "Erreur lors de l'enregistrement" });
    }
  }

  if (isLoading && !isNew) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Retour">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Nouveau client" : (client?.name ?? "Client")}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientForm
                defaultValues={client ?? undefined}
                onSubmit={handleSubmit}
                isLoading={createClient.isPending || updateClient.isPending}
              />
            </CardContent>
          </Card>
        </div>

        {!isNew && client?.invoices && client.invoices.length > 0 && (
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <CardTitle>Factures ({client.invoices.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.invoices.slice(0, 10).map((inv) => (
                  <button
                    key={inv.id}
                    className="flex w-full items-center justify-between rounded-lg border p-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => router.push(`/factures/${inv.id}`)}
                  >
                    <div>
                      <p className="font-medium">{inv.number}</p>
                      <p className="text-xs text-gray-500">{formatDate(inv.issueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(Number(inv.total))}</p>
                      <Badge variant={statusVariant[inv.status] ?? "default"} className="text-xs">
                        {statusLabel[inv.status] ?? inv.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

