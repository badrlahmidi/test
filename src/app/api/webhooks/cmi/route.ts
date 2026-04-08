import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const receivedSig = req.headers.get("x-cmi-signature") ?? "";

  const secret = env.CMI_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Webhook non configuré" }, { status: 503 });
  }

  if (!receivedSig) {
    return NextResponse.json({ message: "Signature manquante" }, { status: 400 });
  }

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(receivedSig),
  );

  if (!isValid) {
    return NextResponse.json({ message: "Signature invalide" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { event: string; data: Record<string, unknown> };

  switch (payload.event) {
    case "payment.success":
      // TODO: mark invoice as paid
      break;
    case "payment.failed":
      // TODO: handle failed payment
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
