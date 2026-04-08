import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";
import { getSession, unauthorized, serverError } from "@/lib/api-utils";

interface ClientRow {
  name?: string;
  email?: string;
  phone?: string;
  ice?: string;
  address?: string;
  city?: string;
  type?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const rows: ClientRow[] = body.rows ?? [];

    const valid: Array<{ name: string; email?: string; phone?: string; ice?: string; address?: string; city?: string; type: "COMPANY" | "INDIVIDUAL"; tenantId: string }> = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const parsed = clientSchema.safeParse(rows[i]);
      if (parsed.success) {
        valid.push({ ...parsed.data, tenantId: session.user.tenantId });
      } else {
        errors.push({ row: i + 1, message: parsed.error.flatten().fieldErrors.name?.[0] ?? "Données invalides" });
      }
    }

    let created = 0;
    if (valid.length > 0) {
      const result = await prisma.client.createMany({ data: valid, skipDuplicates: true });
      created = result.count;
    }

    return NextResponse.json({ created, errors });
  } catch (error) {
    return serverError(error);
  }
}
