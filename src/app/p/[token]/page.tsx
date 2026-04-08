"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, FileText, FileCheck, Building2 } from "lucide-react";

const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon", SENT: "Envoyée", PAID: "Payée",
  PARTIALLY_PAID: "Partielle", OVERDUE: "En retard", CANCELLED: "Annulée",
};
const statusColor: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  PARTIALLY_PAID: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};
const quoteStatusLabel: Record<string, string> = {
  DRAFT: "Brouillon", SENT: "Envoyé", ACCEPTED: "Accepté",
  REJECTED: "Refusé", EXPIRED: "Expiré", CONVERTED: "Converti",
};

function Badge({ status, labels, colors }: { status: string; labels: Record<string, string>; colors: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function ClientPortalPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal", token],
    queryFn: async () => {
      const res = await fetch(`/api/portal/${token}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Erreur");
      }
      return res.json() as Promise<{
        client: { id: string; name: string; email: string | null; phone: string | null; address: string | null; city: string | null };
        tenant: { name: string; email: string | null; phone: string | null; address: string | null; logo: string | null; currency: string };
        invoices: Array<{
          id: string; number: string; issueDate: string; dueDate: string; status: string;
          subtotal: number; tvaAmount: number; total: number; notes?: string;
          items: Array<{ id: string; description: string; quantity: number; unitPrice: number; tvaRate: number; total: number }>;
          payments: Array<{ amount: number; method: string; paidAt: string }>;
        }>;
        quotes: Array<{
          id: string; number: string; issueDate: string; validUntil: string; status: string;
          subtotal: number; tvaAmount: number; total: number;
          items: Array<{ id: string; description: string; quantity: number; unitPrice: number; tvaRate: number; total: number }>;
        }>;
      }>;
    },
    retry: false,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm rounded-xl bg-white p-8 shadow text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-400" aria-hidden="true" />
          <p className="text-lg font-semibold text-gray-900">Lien invalide ou expiré</p>
          <p className="mt-2 text-sm text-gray-500">{error?.message ?? "Ce lien portail n'est plus valide."}</p>
        </div>
      </div>
    );
  }

  const { client, tenant, invoices, quotes } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            {tenant.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logo} alt={tenant.name} className="h-10 w-auto rounded" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-gray-900">{tenant.name}</p>
              <p className="text-xs text-gray-500">
                Portail client — {client.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total facturé</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatCurrency(invoices.reduce((s, i) => s + Number(i.total), 0))}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total payé</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {formatCurrency(
                invoices
                  .filter((i) => i.status === "PAID")
                  .reduce((s, i) => s + Number(i.total), 0),
              )}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Solde restant</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              {formatCurrency(
                invoices
                  .filter((i) => ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(i.status))
                  .reduce((s, i) => s + Number(i.total), 0),
              )}
            </p>
          </div>
        </div>

        {/* Invoices */}
        {invoices.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
              Factures ({invoices.length})
            </h2>
            <div className="space-y-4">
              {invoices.map((inv) => {
                const paid = inv.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
                return (
                  <details key={inv.id} className="group rounded-xl bg-white shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{inv.number}</p>
                          <p className="text-xs text-gray-500">
                            Émission : {formatDate(inv.issueDate)} · Échéance : {formatDate(inv.dueDate)}
                          </p>
                        </div>
                        <Badge status={inv.status} labels={statusLabel} colors={statusColor} />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(Number(inv.total))}</p>
                        {paid > 0 && paid < Number(inv.total) && (
                          <p className="text-xs text-green-600">Payé : {formatCurrency(paid)}</p>
                        )}
                      </div>
                    </summary>
                    <div className="border-t px-5 py-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase text-gray-500">
                            <th className="py-1 pr-3">Description</th>
                            <th className="py-1 pr-3 text-right">Qté</th>
                            <th className="py-1 pr-3 text-right">P.U HT</th>
                            <th className="py-1 text-right">Total HT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-gray-700">
                          {inv.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-1.5 pr-3">{item.description}</td>
                              <td className="py-1.5 pr-3 text-right">{item.quantity}</td>
                              <td className="py-1.5 pr-3 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                              <td className="py-1.5 text-right">{formatCurrency(Number(item.total))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-3 space-y-1 text-right text-sm">
                        <p className="text-gray-500">Sous-total HT : {formatCurrency(Number(inv.subtotal))}</p>
                        <p className="text-gray-500">TVA : {formatCurrency(Number(inv.tvaAmount))}</p>
                        <p className="font-bold">Total TTC : {formatCurrency(Number(inv.total))}</p>
                      </div>
                      {inv.notes && (
                        <p className="mt-3 rounded bg-gray-50 p-2 text-xs text-gray-500">{inv.notes}</p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}

        {/* Quotes */}
        {quotes.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FileCheck className="h-5 w-5 text-amber-600" aria-hidden="true" />
              Devis ({quotes.length})
            </h2>
            <div className="space-y-3">
              {quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{q.number}</p>
                    <p className="text-xs text-gray-500">
                      Émis : {formatDate(q.issueDate)} · Valide jusqu&apos;au : {formatDate(q.validUntil)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge status={q.status} labels={quoteStatusLabel} colors={{
                      DRAFT: "bg-gray-100 text-gray-600",
                      SENT: "bg-blue-100 text-blue-700",
                      ACCEPTED: "bg-green-100 text-green-700",
                      REJECTED: "bg-red-100 text-red-700",
                      EXPIRED: "bg-gray-100 text-gray-500",
                      CONVERTED: "bg-purple-100 text-purple-700",
                    }} />
                    <p className="font-bold text-gray-900">{formatCurrency(Number(q.total))}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-12 border-t bg-white py-6 text-center text-xs text-gray-400">
        {[tenant.name, tenant.address, tenant.phone, tenant.email].filter(Boolean).join(" · ")}
      </footer>
    </div>
  );
}
