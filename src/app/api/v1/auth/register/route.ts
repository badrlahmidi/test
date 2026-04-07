import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser } from "@/lib/services/auth-service";
import { parseBody, validationError, serverError } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = parseBody(registerSchema, body);
    if (!parsed.success) return validationError(parsed.error);

    const user = await registerUser(parsed.data);

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("existe déjà")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return serverError(error);
  }
}
