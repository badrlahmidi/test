import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations/expense";
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
    const category = searchParams.get("category") || "";

    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { reference: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(category && { category: category as never }),
    };

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { expenseDate: "desc" },
      }),
      prisma.expense.count({ where }),
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
    const parsed = parseBody(expenseSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    const expense = await prisma.expense.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
        reference: parsed.data.reference || null,
        expenseDate: new Date(parsed.data.expenseDate),
        tenantId: session.user.tenantId,
      },
    });

    await writeAudit({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "Expense",
      entityId: expense.id,
      action: "CREATE",
      after: expense,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
