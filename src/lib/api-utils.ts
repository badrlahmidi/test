import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodError, type ZodSchema } from "zod";
import * as Sentry from "@sentry/nextjs";

export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
};

export async function getSession(): Promise<AuthSession | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session as unknown as AuthSession;
}

export function unauthorized() {
  return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
}

export function notFound(resource: string = "Ressource") {
  return NextResponse.json(
    { message: `${resource} non trouvé(e)` },
    { status: 404 },
  );
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      message: "Données invalides",
      details: error.flatten().fieldErrors,
    },
    { status: 400 },
  );
}

export function parseBody<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: ZodError } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}

export function serverError(error: unknown) {
  Sentry.captureException(error);
  console.error("API Error:", error);
  return NextResponse.json(
    { message: "Erreur interne du serveur" },
    { status: 500 },
  );
}
