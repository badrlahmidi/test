import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getSession,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        client: { select: { name: true, email: true, address: true, city: true, ice: true } },
        items: true,
        tenant: { select: { name: true, email: true, phone: true, address: true, logo: true } },
      },
    });

    if (!invoice) return notFound("Facture");

    const clientEmail = invoice.client?.email;
    if (!clientEmail) {
      return NextResponse.json(
        { message: "Ce client n'a pas d'adresse email" },
        { status: 422 },
      );
    }

    if (!env.RESEND_API_KEY) {
      return NextResponse.json(
        { message: "Service email non configuré" },
        { status: 503 },
      );
    }

    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);

    const itemsHtml = invoice.items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.description}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${formatCurrency(Number(item.unitPrice))}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${item.tvaRate}%</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${formatCurrency(Number(item.total))}</td>
        </tr>`,
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,sans-serif;color:#111827;">
  <div style="max-width:680px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
    <div style="background:#2563eb;padding:28px 32px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${invoice.tenant.name}</h1>
      <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">Facture ${invoice.number}</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 8px;font-size:15px;">Bonjour <strong>${invoice.client?.name}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        Veuillez trouver ci-dessous votre facture <strong>${invoice.number}</strong>
        du <strong>${formatDate(invoice.issueDate)}</strong>,
        échéance le <strong>${formatDate(invoice.dueDate)}</strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;">Description</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;color:#374151;">Qté</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;color:#374151;">P.U HT</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;color:#374151;">TVA</th>
            <th style="padding:10px 12px;text-align:right;font-weight:600;color:#374151;">Total HT</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="margin-left:auto;width:280px;font-size:14px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;color:#6b7280;">
          <span>Sous-total HT</span><span>${formatCurrency(Number(invoice.subtotal))}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;color:#6b7280;">
          <span>TVA</span><span>${formatCurrency(Number(invoice.tvaAmount))}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #e5e7eb;font-size:16px;font-weight:700;">
          <span>Total TTC</span><span style="color:#2563eb;">${formatCurrency(Number(invoice.total))}</span>
        </div>
      </div>

      ${invoice.notes ? `<div style="margin-top:24px;padding:12px 16px;background:#f9fafb;border-radius:8px;font-size:13px;color:#6b7280;">${invoice.notes}</div>` : ""}

      <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;border-top:1px solid #f0f0f0;padding-top:24px;">
        ${invoice.tenant.name}
        ${invoice.tenant.address ? `· ${invoice.tenant.address}` : ""}
        ${invoice.tenant.phone ? `· ${invoice.tenant.phone}` : ""}
        ${invoice.tenant.email ? `· ${invoice.tenant.email}` : ""}
      </p>
    </div>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: env.RESEND_FROM ?? `noreply@${new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000").hostname}`,
      to: clientEmail,
      subject: `Facture ${invoice.number} — ${invoice.tenant.name}`,
      html,
    });

    // Mark invoice as SENT if it was a DRAFT
    if (invoice.status === "DRAFT") {
      await prisma.invoice.update({
        where: { id },
        data: { status: "SENT" },
      });
    }

    return NextResponse.json({ message: "Facture envoyée par email" });
  } catch (error) {
    return serverError(error);
  }
}
