"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useInvoice,
  useUpdateInvoice,
  useDuplicateInvoice,
  useDeleteInvoice,
} from "@/lib/hooks/use-invoices";
import { useCreatePayment } from "@/lib/hooks/use-payments";
import { PaymentForm } from "@/components/forms/payment-form";
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
import { ArrowLeft, Copy, Trash2, Send, CreditCard, Printer, Mail } from "lucide-react";
import type { PaymentFormData } from "@/lib/validations/payment";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  DRAFT: "default", SENT: "primary", PAID: "success",
  PARTIALLY_PAID: "warning", OVERDUE: "danger", CANCELLED: "default",
};
const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon", SENT: "Envoyée", PAID: "Payée",
  PARTIALLY_PAID: "Partielle", OVERDUE: "En retard", CANCELLED: "Annulée",
};
const methodLabel: Record<string, string> = {
  CASH: "Espèces", CHECK: "Chèque", TRANSFER: "Virement",
  CARD: "Carte", MOBILE_MONEY: "Mobile Money", OTHER: "Autre",
};

export default function FactureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const id = params.id as string;

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { data: invoice, isLoading } = useInvoice(id);
  const updateInvoice = useUpdateInvoice();
  const duplicateInvoice = useDuplicateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const createPayment = useCreatePayment();

  async function handleSendEmail() {
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/v1/factures/${id}/send`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        addToast({ variant: "error", title: json.message ?? "Erreur envoi email" });
      } else {
        addToast({ variant: "success", title: "Facture envoyée par email" });
      }
    } catch {
      addToast({ variant: "error", title: "Erreur envoi email" });
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleMarkSent() {
    try {
      await updateInvoice.mutateAsync({ id, data: { status: "SENT" } });
      addToast({ variant: "success", title: "Facture marquée comme envoyée" });
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  async function handleDuplicate() {
    try {
      const dup = await duplicateInvoice.mutateAsync(id);
      addToast({ variant: "success", title: "Facture dupliquée" });
      router.push(`/factures/${dup.id}`);
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  async function handleDelete() {
    try {
      await deleteInvoice.mutateAsync(id);
      addToast({ variant: "success", title: "Facture supprimée" });
      router.push("/factures");
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  async function handlePayment(data: PaymentFormData) {
    try {
      await createPayment.mutateAsync(data);
      addToast({ variant: "success", title: "Paiement enregistré" });
      setPaymentOpen(false);
    } catch {
      addToast({ variant: "error", title: "Erreur" });
    }
  }

  if (isLoading) {
    return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  }

  if (!invoice) {
    return <p className="text-gray-500">Facture introuvable.</p>;
  }

  const paidAmount = invoice.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const remaining = Number(invoice.total) - paidAmount;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Retour">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
        <Badge variant={statusVariant[invoice.status] ?? "default"}>
          {statusLabel[invoice.status] ?? invoice.status}
        </Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Mail className="h-4 w-4" />}
            onClick={handleSendEmail}
            isLoading={sendingEmail}
          >
            Envoyer par email
          </Button>
          {invoice.status === "DRAFT" && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Send className="h-4 w-4" />}
              onClick={handleMarkSent}
              isLoading={updateInvoice.isPending}
            >
              Marquer envoyée
            </Button>
          )}
          {["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status) && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CreditCard className="h-4 w-4" />}
              onClick={() => setPaymentOpen(true)}
            >
              Ajouter paiement
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Copy className="h-4 w-4" />}
            onClick={handleDuplicate}
            isLoading={duplicateInvoice.isPending}
          >
            Dupliquer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={() => window.open(`/api/v1/factures/${id}/pdf`, "_blank")}
          >
            PDF
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => setDeleteOpen(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Client</dt>
                  <dd className="font-medium">{invoice.client?.name}</dd>
                  {invoice.client?.ice && <dd className="text-xs text-gray-500">ICE: {invoice.client.ice}</dd>}
                </div>
                <div>
                  <dt className="text-gray-500">Date d&apos;émission</dt>
                  <dd className="font-medium">{formatDate(invoice.issueDate)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date d&apos;échéance</dt>
                  <dd className="font-medium">{formatDate(invoice.dueDate)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Adresse</dt>
                  <dd className="font-medium">{invoice.client?.address || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lignes</CardTitle>
            </CardHeader>
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
                    {invoice.items?.map((item) => (
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

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Totaux</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total HT</span>
                <span>{formatCurrency(Number(invoice.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">TVA</span>
                <span>{formatCurrency(Number(invoice.tvaAmount))}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(Number(invoice.total))}</span>
              </div>
              {paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Payé</span>
                    <span>{formatCurrency(paidAmount)}</span>
                  </div>
                  {remaining > 0 && (
                    <div className="flex justify-between font-semibold text-orange-600">
                      <span>Restant</span>
                      <span>{formatCurrency(remaining)}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Paiements</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded border p-2 text-sm">
                    <div>
                      <p className="font-medium">{formatCurrency(Number(p.amount))}</p>
                      <p className="text-xs text-gray-500">
                        {methodLabel[p.method] ?? p.method} · {formatDate(p.paidAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {invoice.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Enregistrer un paiement"
      >
        <PaymentForm
          invoiceId={id}
          maxAmount={remaining > 0 ? remaining : Number(invoice.total)}
          onSubmit={handlePayment}
          onCancel={() => setPaymentOpen(false)}
          isLoading={createPayment.isPending}
        />
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Supprimer la facture"
      >
        <p className="mb-4 text-gray-600">
          Êtes-vous sûr de vouloir supprimer la facture <strong>{invoice.number}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={deleteInvoice.isPending}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}

