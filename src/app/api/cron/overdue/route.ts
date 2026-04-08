import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: "SENT",
        dueDate: { lt: now },
      },
      include: { tenant: { select: { id: true } } },
    });

    let count = 0;
    for (const invoice of overdueInvoices) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });

      // Find the tenant owner to notify
      const owner = await prisma.user.findFirst({
        where: { tenantId: invoice.tenantId, role: "OWNER" },
      });

      if (owner) {
        await createNotification({
          tenantId: invoice.tenantId,
          userId: owner.id,
          type: "INVOICE_OVERDUE",
          title: "Facture en retard",
          body: `La facture ${invoice.number} est en retard de paiement`,
          link: `/factures/${invoice.id}`,
        });
      }
      count++;
    }

    return NextResponse.json({ updated: count });
  } catch (error) {
    console.error("[cron/overdue]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
