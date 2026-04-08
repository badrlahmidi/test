import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, notFound, serverError } from "@/lib/api-utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const client = await prisma.client.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    });
    if (!client) return notFound("Client");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day token

    // Upsert: one active token per client (replace if exists)
    const existing = await prisma.clientPortalToken.findFirst({
      where: { tenantId: session.user.tenantId, clientId: params.id },
    });

    let record;
    if (existing) {
      record = await prisma.clientPortalToken.update({
        where: { id: existing.id },
        data: { expiresAt, token: crypto.randomUUID() },
      });
    } else {
      record = await prisma.clientPortalToken.create({
        data: {
          tenantId: session.user.tenantId,
          clientId: params.id,
          expiresAt,
        },
      });
    }

    return NextResponse.json({ token: record.token, expiresAt: record.expiresAt });
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

    await prisma.clientPortalToken.deleteMany({
      where: { clientId: params.id, tenantId: session.user.tenantId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
