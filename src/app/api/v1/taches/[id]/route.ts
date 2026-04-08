import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/validations/task";
import {
  getSession,
  unauthorized,
  notFound,
  validationError,
  parseBody,
  serverError,
} from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const task = await prisma.task.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    });
    if (!task) return notFound("Tâche");

    return NextResponse.json(task);
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

    const existing = await prisma.task.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Tâche");

    const body = await req.json();
    const parsed = parseBody(taskUpdateSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.description === "") updateData.description = null;
    if (parsed.data.linkedEntityType === "") updateData.linkedEntityType = null;
    if (parsed.data.linkedEntityId === "") updateData.linkedEntityId = null;
    if (parsed.data.dueDate === "") {
      updateData.dueDate = null;
    } else if (parsed.data.dueDate) {
      updateData.dueDate = new Date(parsed.data.dueDate as string);
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(task);
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

    const existing = await prisma.task.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Tâche");

    await prisma.task.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
