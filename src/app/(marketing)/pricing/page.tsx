import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    description: "Pour démarrer",
    features: [
      "10 factures/mois",
      "20 clients",
      "1 utilisateur",
      "50 produits",
      "Export PDF",
    ],
    cta: "Commencer",
    popular: false,
  },
  {
    name: "Starter",
    price: "99",
    description: "Pour les petites entreprises",
    features: [
      "100 factures/mois",
      "200 clients",
      "3 utilisateurs",
      "500 produits",
      "Export PDF & Excel",
      "Support email",
    ],
    cta: "Essai gratuit",
    popular: false,
  },
  {
    name: "Business",
    price: "249",
    description: "Pour les entreprises en croissance",
    features: [
      "Factures illimitées",
      "Clients illimités",
      "10 utilisateurs",
      "Produits illimités",
      "Rapports avancés",
      "Multi-devises",
      "Support prioritaire",
    ],
    cta: "Essai gratuit",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    description: "Pour les grandes structures",
    features: [
      "Tout Business +",
      "Utilisateurs illimités",
      "API access",
      "Support dédié",
      "SLA personnalisé",
      "Formation sur site",
    ],
    cta: "Nous contacter",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Tarifs simples et transparents
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Choisissez le plan adapté à votre entreprise. Tous les prix sont en
          Dirhams (DH) HT/mois.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-6 ${
              plan.popular
                ? "border-blue-600 ring-2 ring-blue-600"
                : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                Populaire
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            <div className="mt-4">
              {plan.price === "Sur mesure" ? (
                <span className="text-2xl font-bold text-gray-900">
                  Sur mesure
                </span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500"> DH/mois</span>
                </>
              )}
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`mt-8 block rounded-lg px-4 py-2 text-center text-sm font-medium ${
                plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
