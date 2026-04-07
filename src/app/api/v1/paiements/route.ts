import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validations/payment";
import {
  getSession,
  unauthorized,
  validationError,
  parseBody,
  serverError,
  notFound,
} from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));

    const where = { tenantId: session.user.tenantId };

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: { select: { id: true, number: true, total: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { paidAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = parseBody(paymentSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    // Verify invoice belongs to tenant
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: parsed.data.invoiceId,
        tenantId: session.user.tenantId,
      },
    });
    if (!invoice) return notFound("Facture");

    const payment = await prisma.payment.create({
      data: {
        ...parsed.data,
        paidAt: new Date(parsed.data.paidAt),
        tenantId: session.user.tenantId,
      },
    });

    // Update invoice status based on payments
    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId: invoice.id },
      _sum: { amount: true },
    });

    const paidAmount = Number(totalPaid._sum.amount || 0);
    const invoiceTotal = Number(invoice.total);

    let newStatus: "PAID" | "PARTIALLY_PAID" = "PARTIALLY_PAID";
    if (paidAmount >= invoiceTotal) {
      newStatus = "PAID";
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: newStatus },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
