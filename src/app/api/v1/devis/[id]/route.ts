import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/validations/quote";
import { calculateLineTotal, calculateTva, calculateTotal } from "@/lib/utils/tva";
import {
  getSession,
  unauthorized,
  validationError,
  parseBody,
  serverError,
  notFound,
} from "@/lib/api-utils";
import { writeAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const quote = await prisma.quote.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        items: true,
        client: { select: { id: true, name: true, email: true, phone: true, address: true, city: true, ice: true } },
      },
    });

    if (!quote) return notFound("Devis");
    return NextResponse.json(quote);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.quote.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Devis");

    const body = await req.json();
    const parsed = parseBody(quoteSchema.partial(), body);
    if (!parsed.success) return validationError(parsed.error);

    const { items, ...quoteData } = parsed.data;

    let updateData: Record<string, unknown> = {
      ...quoteData,
      ...(quoteData.issueDate && { issueDate: new Date(quoteData.issueDate) }),
      ...(quoteData.validUntil && { validUntil: new Date(quoteData.validUntil) }),
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

      await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
      await prisma.quoteItem.createMany({
        data: processedItems.map((item) => ({ ...item, quoteId: id })),
      });
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        client: { select: { id: true, name: true } },
      },
    });

    await writeAudit({ tenantId: session.user.tenantId, userId: session.user.id, entityType: "Quote", entityId: quote.id, action: "UPDATE", before: existing, after: quote });

    return NextResponse.json(quote);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.quote.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Devis");

    await prisma.quote.delete({ where: { id } });
    await writeAudit({ tenantId: session.user.tenantId, userId: session.user.id, entityType: "Quote", entityId: id, action: "DELETE", before: existing });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
