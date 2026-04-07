"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useNextAuthSession();

  return {
    user: session?.user as
      | {
          id: string;
          email: string;
          name: string;
          role: string;
          tenantId: string;
        }
      | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
