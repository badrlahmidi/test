import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { getSession, unauthorized } from "@/lib/api-utils";

type RouteHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

/**
 * RBAC higher-order function that wraps an API route handler,
 * verifying the authenticated user has one of the required roles.
 *
 * @example
 * export const GET = withRole(["OWNER", "ACCOUNTANT"], async (req, context) => { ... });
 */
export function withRole(roles: Role[], handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    const session = await getSession();
    if (!session) return unauthorized();

    if (!roles.includes(session.user.role as Role)) {
      return NextResponse.json(
        { message: "Accès interdit: rôle insuffisant." },
        { status: 403 },
      );
    }

    return handler(req, context);
  };
}
