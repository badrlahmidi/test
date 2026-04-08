import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/services/pdf-service";
import { getSession, unauthorized, serverError, notFound } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        items: true,
        client: true,
        tenant: true,
      },
    });

    if (!invoice) return notFound("Facture");

    const pdfBuffer = await generateInvoicePdf({
      number: invoice.number,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      tenant: {
        name: invoice.tenant.name,
        ice: invoice.tenant.ice,
        ifNumber: invoice.tenant.ifNumber,
        rc: invoice.tenant.rc,
        address: invoice.tenant.address,
        city: invoice.tenant.city,
        phone: invoice.tenant.phone,
        email: invoice.tenant.email,
      },
      client: {
        name: invoice.client.name,
        ice: invoice.client.ice,
        address: invoice.client.address,
        city: invoice.client.city,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        tvaRate: Number(item.tvaRate),
        total: Number(item.total),
      })),
      subtotal: Number(invoice.subtotal),
      tvaAmount: Number(invoice.tvaAmount),
      total: Number(invoice.total),
      notes: invoice.notes,
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
