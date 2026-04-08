import { NextResponse } from "next/server";
import { getSession } from "@/lib/api-utils";

type Role = "OWNER" | "ADMIN" | "MEMBER" | "ACCOUNTANT";

const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 4,
  ADMIN: 3,
  ACCOUNTANT: 2,
  MEMBER: 1,
};

export function withRole(
  allowedRoles: Role[],
  handler: (req: Request, ctx: unknown) => Promise<NextResponse>,
) {
  return async (req: Request, ctx: unknown): Promise<NextResponse> => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const userRole = session.user.role as Role;
    const hasAccess = allowedRoles.some(
      (role) => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role],
    );

    if (!hasAccess) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    return handler(req, ctx);
  };
}

export function isAtLeast(userRole: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}
