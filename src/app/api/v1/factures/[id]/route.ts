import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations/invoice";
import { calculateLineTotal, calculateTva, calculateTotal } from "@/lib/utils/tva";
import { writeAudit } from "@/lib/audit";
import {
  getSession,
  unauthorized,
  validationError,
  parseBody,
  serverError,
  notFound,
} from "@/lib/api-utils";

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
        client: { select: { id: true, name: true, email: true, phone: true, address: true, city: true, ice: true } },
        payments: { orderBy: { paidAt: "desc" } },
      },
    });

    if (!invoice) return notFound("Facture");
    return NextResponse.json(invoice);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.invoice.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Facture");

    const body = await req.json();

    // Allow partial updates (status-only, notes, etc.)
    const parsed = parseBody(invoiceSchema.partial(), body);
    if (!parsed.success) return validationError(parsed.error);

    const { items, ...invoiceData } = parsed.data;

    let updateData: Record<string, unknown> = {
      ...invoiceData,
      ...(invoiceData.issueDate && { issueDate: new Date(invoiceData.issueDate) }),
      ...(invoiceData.dueDate && { dueDate: new Date(invoiceData.dueDate) }),
    };

    if (items && items.length > 0) {
      let subtotal = 0;
      let tvaAmount = 0;
      const processedItems = items.map((item) => {
        const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
        const lineTva = calculateTva(lineTotal, item.tvaRate ?? 20);
        subtotal += lineTotal;
        tvaAmount += lineTva;
        return { ...item, total: lineTotal };
      });
      const total = calculateTotal(subtotal, tvaAmount);
      updateData = { ...updateData, subtotal, tvaAmount, total };

      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await prisma.invoiceItem.createMany({
        data: processedItems.map((item) => ({ ...item, invoiceId: id })),
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        client: { select: { id: true, name: true } },
      },
    });

    await writeAudit({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "Invoice",
      entityId: id,
      action: "UPDATE",
      before: { status: existing.status, total: existing.total },
      after: { status: invoice.status, total: invoice.total },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.invoice.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Facture");

    await prisma.invoice.delete({ where: { id } });

    await writeAudit({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "Invoice",
      entityId: id,
      action: "DELETE",
      before: { number: existing.number, total: existing.total, status: existing.status },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
