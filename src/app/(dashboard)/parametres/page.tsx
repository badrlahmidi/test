"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Building, Users, CreditCard, Shield } from "lucide-react";

export default function ParametresPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Paramètres</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-600" />
              <CardTitle>Entreprise</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Informations légales, ICE, IF, RC, logo, coordonnées.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-600" />
              <CardTitle>Utilisateurs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Gestion des membres de l&apos;équipe et rôles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <CardTitle>Abonnement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Plan actuel, facturation, historique paiements.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <CardTitle>Sécurité</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Mot de passe, sessions actives, journal d&apos;activité.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
