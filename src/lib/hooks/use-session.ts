"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import type { Role } from "@prisma/client";

export function useCurrentUser() {
  const { data: session, status } = useNextAuthSession();

  return {
    user: session?.user as
      | {
          id: string;
          email: string;
          name: string;
          role: Role;
          tenantId: string;
        }
      | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
