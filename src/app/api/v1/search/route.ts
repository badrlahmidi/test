import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorized, serverError } from "@/lib/api-utils";

export interface SearchResult {
  id: string;
  type: "client" | "invoice" | "quote" | "product";
  title: string;
  subtitle: string;
  href: string;
  status?: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const tenantId = session.user.tenantId;
    const contains = { contains: q, mode: "insensitive" as const };

    const [clients, invoices, quotes, products] = await Promise.all([
      prisma.client.findMany({
        where: { tenantId, OR: [{ name: contains }, { email: contains }, { ice: contains }] },
        take: 5,
        select: { id: true, name: true, email: true, city: true },
      }),
      prisma.invoice.findMany({
        where: { tenantId, OR: [{ number: contains }, { client: { name: contains } }] },
        take: 5,
        select: { id: true, number: true, status: true, total: true, client: { select: { name: true } } },
      }),
      prisma.quote.findMany({
        where: { tenantId, OR: [{ number: contains }, { client: { name: contains } }] },
        take: 5,
        select: { id: true, number: true, status: true, total: true, client: { select: { name: true } } },
      }),
      prisma.product.findMany({
        where: { tenantId, isActive: true, OR: [{ name: contains }, { sku: contains }] },
        take: 5,
        select: { id: true, name: true, sku: true, unitPrice: true, category: true },
      }),
    ]);

    const results: SearchResult[] = [
      ...clients.map((c) => ({
        id: c.id,
        type: "client" as const,
        title: c.name,
        subtitle: [c.email, c.city].filter(Boolean).join(" · ") || "Client",
        href: `/clients/${c.id}`,
      })),
      ...invoices.map((inv) => ({
        id: inv.id,
        type: "invoice" as const,
        title: inv.number,
        subtitle: inv.client?.name ?? "",
        href: `/factures/${inv.id}`,
        status: inv.status,
      })),
      ...quotes.map((q) => ({
        id: q.id,
        type: "quote" as const,
        title: q.number,
        subtitle: q.client?.name ?? "",
        href: `/devis/${q.id}`,
        status: q.status,
      })),
      ...products.map((p) => ({
        id: p.id,
        type: "product" as const,
        title: p.name,
        subtitle: [p.sku ? `SKU: ${p.sku}` : null, p.category].filter(Boolean).join(" · ") || "Produit",
        href: `/produits/${p.id}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    return serverError(error);
  }
}
