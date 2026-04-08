import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, serverError } from "@/lib/api-utils";

export interface PlMonthEntry {
  key: string;      // "2024-01"
  month: string;    // "janv. 24"
  revenue: number;
  expenses: number;
  net: number;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const months = Math.min(12, Math.max(3, Number(req.nextUrl.searchParams.get("months") || 6)));

    const since = new Date();
    since.setMonth(since.getMonth() - months + 1);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { tenantId, status: "PAID", issueDate: { gte: since } },
        select: { issueDate: true, total: true },
      }),
      prisma.expense.findMany({
        where: { tenantId, expenseDate: { gte: since } },
        select: { expenseDate: true, amount: true },
      }),
    ]);

    const map = new Map<string, PlMonthEntry>();

    // Populate months skeleton
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (months - 1 - i));
      d.setDate(1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-MA", { month: "short", year: "2-digit" });
      map.set(key, { key, month: label, revenue: 0, expenses: 0, net: 0 });
    }

    for (const inv of invoices) {
      const d = new Date(inv.issueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = map.get(key);
      if (entry) entry.revenue += Number(inv.total);
    }

    for (const exp of expenses) {
      const d = new Date(exp.expenseDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = map.get(key);
      if (entry) entry.expenses += Number(exp.amount);
    }

    const data = Array.from(map.values()).map((e) => ({
      ...e,
      net: e.revenue - e.expenses,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return serverError(error);
  }
}
