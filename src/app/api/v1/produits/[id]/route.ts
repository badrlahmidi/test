import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import {
  getSession,
  unauthorized,
  validationError,
  parseBody,
  serverError,
  notFound,
} from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });

    if (!product) return notFound("Produit");
    return NextResponse.json(product);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.product.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Produit");

    const body = await req.json();
    const parsed = parseBody(productSchema.partial(), body);
    if (!parsed.success) return validationError(parsed.error);

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(product);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await prisma.product.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });
    if (!existing) return notFound("Produit");

    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError(error);
  }
}
