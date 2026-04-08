"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuote, useDeleteQuote, useConvertQuote, useUpdateQuote } from "@/lib/hooks/use-quotes";
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
import { ArrowLeft, ArrowRight, Trash2, Send } from "lucide-react";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  DRAFT: "default", SENT: "primary", ACCEPTED: "success",
  REJECTED: "danger", EXPIRED: "warning", CONVERTED: "default",
};
const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon", SENT: "Envoyé", ACCEPTED: "Accepté",
  REJECTED: "Refusé", EXPIRED: "Expiré", CONVERTED: "Converti",
};

export default function DevisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const id = params.id as string;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  const { data: quote, isLoading } = useQuote(id);
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();
  const convertQuote = useConvertQuote();

  async function handleMarkSent() {
    try {
      await updateQuote.mutateAsync({ id, data: { status: "SENT" } });
      addToast({ variant: "success", title: "Devis marqué comme envoyé" });
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  async function handleConvert() {
    try {
      const invoice = await convertQuote.mutateAsync(id);
      addToast({ variant: "success", title: "Devis converti en facture" });
      router.push(`/factures/${invoice.id}`);
    } catch (err) {
      addToast({ variant: "error", title: err instanceof Error ? err.message : "Erreur" });
    }
    setConvertOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteQuote.mutateAsync(id);
      addToast({ variant: "success", title: "Devis supprimé" });
      router.push("/devis");
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (!quote) return <p className="text-gray-500">Devis introuvable.</p>;

  const canConvert = ["DRAFT", "SENT", "ACCEPTED"].includes(quote.status) && !quote.convertedToInvoiceId;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Retour">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{quote.number}</h1>
        <Badge variant={statusVariant[quote.status] ?? "default"}>
          {statusLabel[quote.status] ?? quote.status}
        </Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          {quote.status === "DRAFT" && (
            <Button variant="secondary" size="sm" leftIcon={<Send className="h-4 w-4" />} onClick={handleMarkSent} isLoading={updateQuote.isPending}>
              Marquer envoyé
            </Button>
          )}
          {canConvert && (
            <Button size="sm" leftIcon={<ArrowRight className="h-4 w-4" />} onClick={() => setConvertOpen(true)}>
              Convertir en facture
            </Button>
          )}
          <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Client</dt>
                  <dd className="font-medium">{quote.client?.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date d&apos;émission</dt>
                  <dd className="font-medium">{formatDate(quote.issueDate)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Valide jusqu&apos;au</dt>
                  <dd className="font-medium">{formatDate(quote.validUntil)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Lignes</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4 text-right">Qté</th>
                      <th className="py-2 pr-4 text-right">P.U HT</th>
                      <th className="py-2 pr-4 text-right">TVA</th>
                      <th className="py-2 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {quote.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 pr-4">{item.description}</td>
                        <td className="py-2 pr-4 text-right">{item.quantity}</td>
                        <td className="py-2 pr-4 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                        <td className="py-2 pr-4 text-right">{item.tvaRate}%</td>
                        <td className="py-2 text-right">{formatCurrency(Number(item.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Totaux</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total HT</span>
                <span>{formatCurrency(Number(quote.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">TVA</span>
                <span>{formatCurrency(Number(quote.tvaAmount))}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(Number(quote.total))}</span>
              </div>
            </CardContent>
          </Card>
          {quote.notes && (
            <Card className="mt-4">
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600">{quote.notes}</p></CardContent>
            </Card>
          )}
          {quote.convertedToInvoiceId && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
              <p className="font-medium text-green-800">Ce devis a été converti en facture.</p>
              <button
                className="mt-1 text-green-700 underline"
                onClick={() => router.push(`/factures/${quote.convertedToInvoiceId}`)}
              >
                Voir la facture →
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={convertOpen} onClose={() => setConvertOpen(false)} title="Convertir en facture">
        <p className="mb-4 text-gray-600">
          Convertir le devis <strong>{quote.number}</strong> en facture ? Le statut du devis sera changé en &quot;Converti&quot;.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConvertOpen(false)}>Annuler</Button>
          <Button onClick={handleConvert} isLoading={convertQuote.isPending}>Confirmer</Button>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Supprimer le devis">
        <p className="mb-4 text-gray-600">
          Supprimer définitivement le devis <strong>{quote.number}</strong> ?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={deleteQuote.isPending}>Supprimer</Button>
        </div>
      </Modal>
    </div>
  );
}

