"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  FileText,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";
import type { DashboardStats } from "@/types";

async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch("/api/v1/rapports");
  if (!res.ok) throw new Error("Erreur chargement dashboard");
  return res.json();
}

export default function DashboardOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  const stats = [
    {
      title: "CA du mois",
      value: data ? formatCurrency(data.monthlyRevenue) : "—",
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Factures en attente",
      value: data ? `${data.pendingInvoices}` : "—",
      subtitle: data ? formatCurrency(data.pendingAmount) : undefined,
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total clients",
      value: data ? `${data.totalClients}` : "—",
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Alertes stock",
      value: data ? `${data.lowStockProducts}` : "—",
      icon: Package,
      color: "text-orange-600 bg-orange-100",
    },
    {
      title: "Factures en retard",
      value: data ? `${data.overdueInvoices}` : "—",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Tableau de bord
      </h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="mb-0 flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="mt-1 text-xs text-gray-500">
                    {stat.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
