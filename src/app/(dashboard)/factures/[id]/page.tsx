"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export default function FactureDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Facture
        </h1>
        <Badge variant="primary">{params.id}</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Le détail complet de la facture sera affiché ici.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
