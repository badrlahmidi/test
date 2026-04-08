import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/validations/quote";
import { generateQuoteNumber } from "@/lib/utils/invoice-number";
import { calculateLineTotal, calculateTva, calculateTotal } from "@/lib/utils/tva";
import {
  getSession,
  unauthorized,
  validationError,
  parseBody,
  serverError,
} from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const rateLimitRes = await checkRateLimit(session.user.tenantId);
    if (rateLimitRes) return rateLimitRes;

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));

    const where = { tenantId: session.user.tenantId };

    const [data, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: { client: { select: { id: true, name: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.quote.count({ where }),
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

    const rateLimitRes = await checkRateLimit(session.user.tenantId);
    if (rateLimitRes) return rateLimitRes;

    const body = await req.json();
    const parsed = parseBody(quoteSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    const { items, ...quoteData } = parsed.data;

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

    const count = await prisma.quote.count({
      where: { tenantId: session.user.tenantId },
    });
    const number = generateQuoteNumber(count + 1);

    const quote = await prisma.quote.create({
      data: {
        ...quoteData,
        number,
        issueDate: new Date(quoteData.issueDate),
        validUntil: new Date(quoteData.validUntil),
        subtotal,
        tvaAmount,
        total,
        tenantId: session.user.tenantId,
        items: {
          create: processedItems,
        },
      },
      include: {
        items: true,
        client: { select: { id: true, name: true } },
      },
    });

    await writeAudit({ tenantId: session.user.tenantId, userId: session.user.id, entityType: "Quote", entityId: quote.id, action: "CREATE", after: quote });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
