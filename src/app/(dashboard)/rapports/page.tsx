"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BarChart3, TrendingUp, FileSpreadsheet } from "lucide-react";

export default function RapportsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Rapports</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>Chiffre d&apos;affaires</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Analyse du CA mensuel et annuel avec graphiques et tendances.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>Balance clients</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Vue des créances clients et soldes en attente.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>État de stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Inventaire actuel, alertes stock bas, mouvements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
