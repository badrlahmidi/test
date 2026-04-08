import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";
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
    const client = await prisma.client.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        invoices: {
          select: { id: true, number: true, status: true, total: true, issueDate: true, dueDate: true },
          orderBy: { createdAt: "desc" },
        },
        quotes: {
          select: { id: true, number: true, status: true, total: true, issueDate: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) return notFound("Client");
    return NextResponse.json(client);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.client.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Client");

    const body = await req.json();
    const parsed = parseBody(clientSchema.partial(), body);
    if (!parsed.success) return validationError(parsed.error);

    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });

    await writeAudit({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "Client",
      entityId: id,
      action: "UPDATE",
      before: existing,
      after: client,
    });

    return NextResponse.json(client);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.client.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Client");

    await prisma.client.delete({ where: { id } });

    await writeAudit({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entityType: "Client",
      entityId: id,
      action: "DELETE",
      before: existing,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
