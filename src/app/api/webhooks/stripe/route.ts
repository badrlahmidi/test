import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  // HMAC signature verification
  const elements = signature.split(",");
  const timestamp = elements.find((e) => e.startsWith("t="))?.slice(2);
  const receivedSig = elements.find((e) => e.startsWith("v1="))?.slice(3);

  if (!timestamp || !receivedSig || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Signature manquante" }, { status: 400 });
  }

  const expectedSig = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(receivedSig),
  );

  if (!isValid) {
    return NextResponse.json({ message: "Signature invalide" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { type: string; data: { object: Record<string, unknown> } };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      // TODO: update tenant plan based on subscription
      break;
    case "customer.subscription.deleted":
      // TODO: downgrade tenant to FREE
      break;
    case "invoice.payment_succeeded":
      // TODO: record payment
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
