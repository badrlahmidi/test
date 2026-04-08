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

    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const logoFile = formData.get("logo");

      if (logoFile && logoFile instanceof Blob) {
        const { put } = await import("@vercel/blob");
        const filename = logoFile instanceof File ? logoFile.name : "logo";
        const blob = await put(`logos/${session.user.tenantId}/${filename}`, logoFile, { access: "public" });
        const tenant = await prisma.tenant.update({
          where: { id: session.user.tenantId },
          data: { logo: blob.url },
        });
        return NextResponse.json(tenant);
      }
      return NextResponse.json({ message: "Aucun fichier fourni" }, { status: 400 });
    }

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
