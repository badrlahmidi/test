import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import { addMonths, addYears } from "date-fns";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const dueInvoices = await prisma.invoice.findMany({
      where: {
        recurringInterval: { not: "NONE" },
        nextInvoiceDate: { lte: now },
      },
      include: { items: true },
    });

    let created = 0;
    for (const source of dueInvoices) {
      const today = new Date();
      const dueDate = addMonths(today, 1);
      const suffix = Date.now();

      await prisma.invoice.create({
        data: {
          tenantId: source.tenantId,
          clientId: source.clientId,
          number: `${source.number}-REC-${suffix}`,
          issueDate: today,
          dueDate,
          status: "DRAFT",
          subtotal: source.subtotal,
          tvaAmount: source.tvaAmount,
          total: source.total,
          notes: source.notes,
          recurringInterval: "NONE",
          items: {
            create: source.items.map((item) => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              tvaRate: item.tvaRate,
              total: item.total,
            })),
          },
        },
      });

      // Advance nextInvoiceDate
      let nextDate: Date;
      if (source.recurringInterval === "MONTHLY") {
        nextDate = addMonths(source.nextInvoiceDate ?? now, 1);
      } else if (source.recurringInterval === "QUARTERLY") {
        nextDate = addMonths(source.nextInvoiceDate ?? now, 3);
      } else {
        nextDate = addYears(source.nextInvoiceDate ?? now, 1);
      }

      await prisma.invoice.update({
        where: { id: source.id },
        data: { nextInvoiceDate: nextDate },
      });

      created++;
    }

    return NextResponse.json({ created });
  } catch (error) {
    console.error("[cron/recurring]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
