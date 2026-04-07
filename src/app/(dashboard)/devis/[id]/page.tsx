"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export default function DevisDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
        <Badge variant="primary">{params.id}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Détails du devis</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500">Le détail complet du devis sera affiché ici.</p>
        </CardContent>
      </Card>
    </div>
  );
}
