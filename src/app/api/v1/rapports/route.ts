import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, serverError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      monthlyRevenue,
      pendingInvoices,
      totalClients,
      lowStockProducts,
      overdueInvoices,
    ] = await Promise.all([
      // Monthly revenue
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: "PAID",
          issueDate: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),

      // Pending invoices
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: { in: ["SENT", "PARTIALLY_PAID"] },
        },
        _count: true,
        _sum: { total: true },
      }),

      // Total clients
      prisma.client.count({ where: { tenantId } }),

      // Low stock products
      prisma.product.count({
        where: {
          tenantId,
          isActive: true,
          stockQty: { lte: prisma.product.fields.minStockAlert as never },
        },
      }),

      // Overdue invoices
      prisma.invoice.count({
        where: {
          tenantId,
          status: { in: ["SENT", "PARTIALLY_PAID"] },
          dueDate: { lt: now },
        },
      }),
    ]);

    return NextResponse.json({
      monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
      pendingInvoices: pendingInvoices._count,
      pendingAmount: Number(pendingInvoices._sum.total || 0),
      totalClients,
      lowStockProducts,
      overdueInvoices,
    });
  } catch (error) {
    return serverError(error);
  }
}
