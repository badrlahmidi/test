import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/validations/task";
import {
  getSession,
  unauthorized,
  validationError,
  parseBody,
  serverError,
} from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const rateLimitRes = await checkRateLimit(session.user.tenantId);
    if (rateLimitRes) return rateLimitRes;

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const search = searchParams.get("search") || "";

    const where = {
      tenantId: session.user.tenantId,
      ...(status && { status: status as never }),
      ...(priority && { priority: priority as never }),
      ...(search && { title: { contains: search, mode: "insensitive" as const } }),
    };

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          { status: "asc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.task.count({ where }),
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
    const parsed = parseBody(taskSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        linkedEntityType: parsed.data.linkedEntityType || null,
        linkedEntityId: parsed.data.linkedEntityId || null,
        tenantId: session.user.tenantId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
