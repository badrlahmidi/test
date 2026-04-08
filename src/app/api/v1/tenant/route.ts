import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tenantSchema } from "@/lib/validations/tenant";
import {
  getSession,
  unauthorized,
  validationError,
  parseBody,
  serverError,
  notFound,
} from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });
    if (!tenant) return notFound("Tenant");
    return NextResponse.json(tenant);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = parseBody(tenantSchema.partial(), body);
    if (!parsed.success) return validationError(parsed.error);

    const tenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: parsed.data,
    });

    return NextResponse.json(tenant);
  } catch (error) {
    return serverError(error);
  }
}
