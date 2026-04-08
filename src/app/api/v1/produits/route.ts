import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
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
    const search = searchParams.get("search") || "";

    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
          { category: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
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
    const parsed = parseBody(productSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        unitPrice: parsed.data.unitPrice,
        tenantId: session.user.tenantId,
      },
    });

    await writeAudit({ tenantId: session.user.tenantId, userId: session.user.id, entityType: "Product", entityId: product.id, action: "CREATE", after: product });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
