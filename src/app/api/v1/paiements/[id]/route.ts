import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSession,
  unauthorized,
  serverError,
  notFound,
} from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const payment = await prisma.payment.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        invoice: { select: { id: true, number: true, total: true } },
      },
    });

    if (!payment) return notFound("Paiement");
    return NextResponse.json(payment);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.payment.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Paiement");

    await prisma.payment.delete({ where: { id } });

    // Recalculate invoice status
    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId: existing.invoiceId },
      _sum: { amount: true },
    });
    const paidAmount = Number(totalPaid._sum.amount || 0);
    const invoice = await prisma.invoice.findUnique({ where: { id: existing.invoiceId } });
    if (invoice) {
      const invoiceTotal = Number(invoice.total);
      const newStatus =
        paidAmount <= 0
          ? "SENT"
          : paidAmount >= invoiceTotal
            ? "PAID"
            : "PARTIALLY_PAID";
      await prisma.invoice.update({
        where: { id: existing.invoiceId },
        data: { status: newStatus },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
