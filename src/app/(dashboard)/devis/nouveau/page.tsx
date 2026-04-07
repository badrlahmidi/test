"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export default function NouveauDevisPage() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Formulaire de devis</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500">Le formulaire de devis est similaire à celui des factures avec une date de validité.</p>
        </CardContent>
      </Card>
    </div>
  );
}
