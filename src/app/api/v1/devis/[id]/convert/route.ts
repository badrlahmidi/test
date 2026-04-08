import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/utils/invoice-number";
import {
  getSession,
  unauthorized,
  serverError,
  notFound,
} from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const quote = await prisma.quote.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: { items: true },
    });
    if (!quote) return notFound("Devis");

    if (quote.convertedToInvoiceId) {
      return NextResponse.json(
        { message: "Ce devis a déjà été converti en facture" },
        { status: 409 },
      );
    }

    const count = await prisma.invoice.count({
      where: { tenantId: session.user.tenantId },
    });
    const number = generateInvoiceNumber(count + 1);

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          tenantId: quote.tenantId,
          clientId: quote.clientId,
          number,
          issueDate: now,
          dueDate,
          status: "DRAFT",
          subtotal: quote.subtotal,
          tvaAmount: quote.tvaAmount,
          total: quote.total,
          notes: quote.notes,
          items: {
            create: quote.items.map(({ id: _id, quoteId: _q, ...item }) => item),
          },
        },
        include: {
          items: true,
          client: { select: { id: true, name: true } },
        },
      });

      await tx.quote.update({
        where: { id },
        data: { status: "CONVERTED", convertedToInvoiceId: newInvoice.id },
      });

      return newInvoice;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
