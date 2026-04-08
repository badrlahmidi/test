"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useInvoices } from "@/lib/hooks/use-invoices";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, SkeletonCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { Download, TrendingUp, TrendingDown, Scale } from "lucide-react";
import type { PlMonthEntry } from "@/app/api/v1/rapports/pl/route";

function useMonthlyPL(months = 6) {
  return useQuery<{ data: PlMonthEntry[] }>({
    queryKey: ["rapports-pl", months],
    queryFn: async () => {
      const res = await fetch(`/api/v1/rapports/pl?months=${months}`);
      if (!res.ok) throw new Error("Erreur P&L");
      return res.json();
    },
    staleTime: 60_000,
  });
}

function buildMonthlyData(invoices: Array<{ issueDate: string; total: number; status: string }>) {
  const map = new Map<string, { month: string; revenue: number; pending: number }>();
  for (const inv of invoices) {
    const d = new Date(inv.issueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-MA", { month: "short", year: "2-digit" });
    if (!map.has(key)) map.set(key, { month: label, revenue: 0, pending: 0 });
    const entry = map.get(key)!;
    if (inv.status === "PAID") entry.revenue += Number(inv.total);
    else if (["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status))
      entry.pending += Number(inv.total);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([, v]) => v);
}

export default function RapportsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboard();
  const { data: invoicesData, isLoading: invLoading } = useInvoices({ pageSize: 200 });
  const { data: plData, isLoading: plLoading } = useMonthlyPL(6);

  const monthlyData = buildMonthlyData(invoicesData?.data ?? []);
  const plMonthly = plData?.data ?? [];

  async function handleExport() {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Factures");
    ws.columns = [
      { header: "N°", key: "number", width: 16 },
      { header: "Client", key: "client", width: 30 },
      { header: "Date", key: "date", width: 14 },
      { header: "Échéance", key: "due", width: 14 },
      { header: "Statut", key: "status", width: 14 },
      { header: "Total TTC", key: "total", width: 14 },
    ];
    for (const inv of invoicesData?.data ?? []) {
      ws.addRow({
        number: inv.number,
        client: inv.client?.name,
        date: new Date(inv.issueDate).toLocaleDateString("fr-MA"),
        due: new Date(inv.dueDate).toLocaleDateString("fr-MA"),
        status: inv.status,
        total: Number(inv.total),
      });
    }
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factures-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (statsLoading || invLoading) {
    return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  }

  const netProfit = stats?.netProfit ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handleExport}
        >
          Exporter Excel
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "CA du mois", value: formatCurrency(stats?.monthlyRevenue ?? 0), color: "text-green-600", Icon: TrendingUp },
          { label: "Dépenses du mois", value: formatCurrency(stats?.monthlyExpenses ?? 0), color: "text-red-600", Icon: TrendingDown },
          { label: "Résultat net", value: formatCurrency(netProfit), color: netProfit >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold", Icon: Scale },
          { label: "Factures en attente", value: String(stats?.pendingInvoices ?? 0), color: "text-blue-600", Icon: null },
          { label: "Factures en retard", value: String(stats?.overdueInvoices ?? 0), color: "text-red-600", Icon: null },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500">{item.label}</CardTitle>
                {item.Icon && <item.Icon className={`h-4 w-4 ${item.color}`} aria-hidden="true" />}
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* P&L Chart */}
      {!plLoading && plMonthly.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compte de résultat mensuel (Revenus vs Dépenses vs Résultat net)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={plMonthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="revenue" name="Revenus" stroke="#16a34a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" name="Dépenses" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="net" name="Résultat net" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d&apos;affaires mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  fill="url(#colorRevenue)"
                  name="CA encaissé"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CA vs En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Encaissé" fill="#16a34a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="pending" name="En attente" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

