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
    const existing = await prisma.invoice.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: { items: true },
    });
    if (!existing) return notFound("Facture");

    const count = await prisma.invoice.count({
      where: { tenantId: session.user.tenantId },
    });
    const number = generateInvoiceNumber(count + 1);

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const duplicate = await prisma.invoice.create({
      data: {
        tenantId: existing.tenantId,
        clientId: existing.clientId,
        number,
        issueDate: now,
        dueDate,
        status: "DRAFT",
        subtotal: existing.subtotal,
        tvaAmount: existing.tvaAmount,
        total: existing.total,
        notes: existing.notes,
        items: {
          create: existing.items.map(({ id: _id, invoiceId: _inv, ...item }) => item),
        },
      },
      include: {
        items: true,
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
