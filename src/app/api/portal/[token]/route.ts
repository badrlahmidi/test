import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const record = await prisma.clientPortalToken.findUnique({
      where: { token: params.token },
    });

    if (!record) {
      return NextResponse.json({ message: "Lien invalide ou expiré" }, { status: 404 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ message: "Ce lien a expiré" }, { status: 410 });
    }

    const [client, invoices, quotes] = await Promise.all([
      prisma.client.findFirst({
        where: { id: record.clientId, tenantId: record.tenantId },
        select: { id: true, name: true, email: true, phone: true, address: true, city: true, type: true },
      }),
      prisma.invoice.findMany({
        where: { clientId: record.clientId, tenantId: record.tenantId },
        include: { items: true, payments: { select: { amount: true, method: true, paidAt: true } } },
        orderBy: { issueDate: "desc" },
        take: 50,
      }),
      prisma.quote.findMany({
        where: { clientId: record.clientId, tenantId: record.tenantId },
        include: { items: true },
        orderBy: { issueDate: "desc" },
        take: 20,
      }),
    ]);

    if (!client) {
      return NextResponse.json({ message: "Lien invalide" }, { status: 404 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: { id: record.tenantId },
      select: { name: true, email: true, phone: true, address: true, logo: true, currency: true },
    });

    return NextResponse.json({ client, invoices, quotes, tenant });
  } catch (error) {
    return serverError(error);
  }
}
