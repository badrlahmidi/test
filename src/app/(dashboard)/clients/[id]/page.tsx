"use client";

import { useState } from "react";
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
  Modal,
  SkeletonCard,
} from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft, FileText, Link, Copy, Trash2 } from "lucide-react";
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

  const [portalOpen, setPortalOpen] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [portalExpiry, setPortalExpiry] = useState<string | null>(null);
  const [generatingPortal, setGeneratingPortal] = useState(false);

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

  async function handleGeneratePortal() {
    setGeneratingPortal(true);
    try {
      const res = await fetch(`/api/v1/clients/${id}/portal-token`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      const url = `${window.location.origin}/p/${json.token}`;
      setPortalUrl(url);
      setPortalExpiry(json.expiresAt);
      setPortalOpen(true);
    } catch {
      addToast({ variant: "error", title: "Erreur génération du lien portail" });
    } finally {
      setGeneratingPortal(false);
    }
  }

  async function handleCopyPortal() {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    addToast({ variant: "success", title: "Lien copié dans le presse-papier" });
  }

  async function handleRevokePortal() {
    await fetch(`/api/v1/clients/${id}/portal-token`, { method: "DELETE" });
    setPortalUrl(null);
    setPortalOpen(false);
    addToast({ variant: "success", title: "Accès portail révoqué" });
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
        {!isNew && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Link className="h-4 w-4" />}
            onClick={handleGeneratePortal}
            isLoading={generatingPortal}
            className="ml-auto"
          >
            Portail client
          </Button>
        )}
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

      {/* Portal modal */}
      <Modal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        title="Lien portail client"
        description={portalExpiry ? `Expire le ${formatDate(portalExpiry)}` : undefined}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Partagez ce lien avec votre client pour qu&apos;il puisse consulter ses factures et devis sans
            avoir besoin d&apos;un compte.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={portalUrl ?? ""}
              className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none"
            />
            <Button size="sm" variant="secondary" onClick={handleCopyPortal} leftIcon={<Copy className="h-4 w-4" />}>
              Copier
            </Button>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={handleRevokePortal}>
              Révoquer l&apos;accès
            </Button>
            <Button size="sm" onClick={() => window.open(portalUrl ?? "", "_blank")}>
              Ouvrir le portail
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


