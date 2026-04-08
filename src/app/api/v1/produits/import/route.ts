import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { getSession, unauthorized, serverError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const rows: unknown[] = body.rows ?? [];

    const valid: Array<Record<string, unknown>> = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const parsed = productSchema.safeParse(rows[i]);
      if (parsed.success) {
        valid.push({ ...parsed.data, tenantId: session.user.tenantId });
      } else {
        errors.push({ row: i + 1, message: parsed.error.flatten().fieldErrors.name?.[0] ?? "Données invalides" });
      }
    }

    let created = 0;
    if (valid.length > 0) {
      const result = await prisma.product.createMany({ data: valid as Parameters<typeof prisma.product.createMany>[0]["data"], skipDuplicates: true });
      created = result.count;
    }

    return NextResponse.json({ created, errors });
  } catch (error) {
    return serverError(error);
  }
}
