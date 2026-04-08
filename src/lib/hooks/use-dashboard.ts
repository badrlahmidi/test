import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/types";

async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch("/api/v1/rapports");
  if (!res.ok) throw new Error("Erreur chargement dashboard");
  return res.json();
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30 * 1000,
  });
}
