"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { usePendingTasksCount } from "@/lib/hooks/use-tasks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonCard,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  FileText,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Scale,
  ClipboardList,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStats } from "@/types";
import Link from "next/link";

function buildMonthlyChart(invoices: Array<{ issueDate: string; total: number; status: string }>) {
  const map = new Map<string, { month: string; revenue: number }>();
  for (const inv of invoices) {
    if (inv.status !== "PAID") continue;
    const d = new Date(inv.issueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-MA", { month: "short", year: "2-digit" });
    if (!map.has(key)) map.set(key, { month: label, revenue: 0 });
    map.get(key)!.revenue += Number(inv.total);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const content = (
    <Card className={href ? "cursor-pointer transition hover:shadow-md" : ""}>
      <CardHeader className="mb-0 flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function buildStats(data: DashboardStats, pendingTasks: number) {
  const netProfit = data.netProfit ?? 0;
  return [
    {
      title: "CA du mois",
      value: formatCurrency(data.monthlyRevenue),
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Dépenses du mois",
      value: formatCurrency(data.monthlyExpenses ?? 0),
      icon: TrendingDown,
      color: "text-red-600 bg-red-100",
      href: "/depenses",
    },
    {
      title: "Résultat net",
      value: formatCurrency(netProfit),
      icon: Scale,
      color: netProfit >= 0 ? "text-emerald-600 bg-emerald-100" : "text-red-600 bg-red-100",
    },
    {
      title: "Factures en attente",
      value: `${data.pendingInvoices}`,
      subtitle: formatCurrency(data.pendingAmount),
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
      href: "/factures",
    },
    {
      title: "Total clients",
      value: `${data.totalClients}`,
      icon: Users,
      color: "text-purple-600 bg-purple-100",
      href: "/clients",
    },
    {
      title: "Alertes stock",
      value: `${data.lowStockProducts}`,
      icon: Package,
      color: "text-orange-600 bg-orange-100",
      href: "/produits",
    },
    {
      title: "Factures en retard",
      value: `${data.overdueInvoices}`,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
    },
    {
      title: "Tâches à faire",
      value: `${pendingTasks}`,
      icon: ClipboardList,
      color: "text-indigo-600 bg-indigo-100",
      href: "/taches",
    },
  ];
}

export default function DashboardOverviewPage() {
  const { data, isLoading } = useDashboard();
  const { data: invoicesData } = useInvoices({ pageSize: 200 });
  const { data: pendingTasks = 0 } = usePendingTasksCount();

  const chartData = buildMonthlyChart(invoicesData?.data ?? []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {buildStats(data, pendingTasks).map((stat) => (
            <KpiCard key={stat.title} {...stat} />
          ))}
        </div>
      ) : null}

      {chartData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>CA mensuel encaissé (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#colorRev)"
                  name="CA encaissé"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

