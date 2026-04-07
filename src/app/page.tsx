import Link from "next/link";
import { FileText, Users, Package, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Facturation",
    description:
      "Créez et envoyez des factures professionnelles conformes à la réglementation marocaine (ICE, TVA).",
  },
  {
    icon: Users,
    title: "Gestion clients",
    description:
      "Base de données clients complète avec historique des transactions et suivi des créances.",
  },
  {
    icon: Package,
    title: "Stock & Produits",
    description:
      "Catalogue produits avec suivi de stock en temps réel et alertes automatiques.",
  },
  {
    icon: BarChart3,
    title: "Rapports",
    description:
      "Tableaux de bord et rapports détaillés pour piloter votre activité.",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description:
      "Données chiffrées, accès par rôle, et hébergement conforme aux normes.",
  },
  {
    icon: Zap,
    title: "Simple & Rapide",
    description:
      "Interface intuitive pensée pour les TPE/PME. Prise en main en 5 minutes.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-blue-600">
            ERP Maroc
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Tarifs
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Essai gratuit
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          La gestion de votre entreprise,{" "}
          <span className="text-blue-600">simplifiée</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          ERP Maroc est le logiciel de facturation et de gestion commerciale
          conçu pour les TPE/PME marocaines. Conforme TVA, ICE, et
          réglementation locale.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Essai gratuit — 0 DH
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Tout ce dont vous avez besoin
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border p-6">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">
          Commencez gratuitement dès aujourd&apos;hui
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-blue-100">
          Aucune carte bancaire requise. Plan gratuit avec 10 factures/mois.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          Créer mon compte gratuit
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ERP Maroc. Tous droits réservés.
      </footer>
    </div>
  );
}
