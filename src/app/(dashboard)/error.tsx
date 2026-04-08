"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      role="alert"
    >
      <div className="rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        Une erreur est survenue
      </h2>
      <p className="max-w-md text-center text-gray-500">{error.message}</p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
