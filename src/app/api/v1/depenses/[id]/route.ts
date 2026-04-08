import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseUpdateSchema } from "@/lib/validations/expense";
import {
  getSession,
  unauthorized,
  notFound,
  validationError,
  parseBody,
  serverError,
} from "@/lib/api-utils";
import { writeAudit } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const expense = await prisma.expense.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    });
    if (!expense) return notFound("Dépense");

    return NextResponse.json(expense);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const existing = await prisma.expense.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Dépense");

    const body = await req.json();
    const parsed = parseBody(expenseUpdateSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.description === "") updateData.description = null;
    if (parsed.data.reference === "") updateData.reference = null;
    if (parsed.data.expenseDate) updateData.expenseDate = new Date(parsed.data.expenseDate as string);

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: updateData,
    });

    await writeAudit({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "Expense",
      entityId: expense.id,
      action: "UPDATE",
      before: existing,
      after: expense,
    });

    return NextResponse.json(expense);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const existing = await prisma.expense.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Dépense");

    await prisma.expense.delete({ where: { id: params.id } });

    await writeAudit({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "Expense",
      entityId: params.id,
      action: "DELETE",
      before: existing,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
