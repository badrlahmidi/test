"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";

interface OnboardingWizardProps {
  tenantId: string;
  onComplete: () => void;
}

const STEPS = ["Entreprise", "Premier produit", "Premier client"];

export function OnboardingWizard({ tenantId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Step 0: company info
  const [companyName, setCompanyName] = React.useState("");
  const [companyPhone, setCompanyPhone] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");

  // Step 1: first product
  const [productName, setProductName] = React.useState("");
  const [productPrice, setProductPrice] = React.useState("");

  // Step 2: first client
  const [clientName, setClientName] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");

  async function handleStep0() {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/v1/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, phone: companyPhone, address: companyAddress }),
      });
      setStep(1);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep1() {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/v1/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName, unitPrice: Number(productPrice) }),
      });
      setStep(2);
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2() {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clientName, email: clientEmail }),
      });
      localStorage.setItem(`onboarding_${tenantId}`, "complete");
      onComplete();
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open title="Bienvenue — Configuration initiale" onClose={onComplete} size="md">
      <div className="mb-4 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 rounded-full py-1 text-center text-xs font-medium ${i === step ? "bg-blue-600 text-white" : i < step ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      {step === 0 && (
        <div className="space-y-3">
          <input placeholder="Nom de l'entreprise" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Téléphone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Adresse" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleStep0} disabled={!companyName || loading} className="w-full rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "..." : "Suivant →"}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <input placeholder="Nom du produit" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="number" placeholder="Prix unitaire (MAD)" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="flex-1 rounded-md border py-2 text-sm text-gray-600 hover:bg-gray-50">← Retour</button>
            <button onClick={handleStep1} disabled={!productName || !productPrice || loading} className="flex-1 rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? "..." : "Suivant →"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <input placeholder="Nom du client" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="email" placeholder="Email du client" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 rounded-md border py-2 text-sm text-gray-600 hover:bg-gray-50">← Retour</button>
            <button onClick={handleStep2} disabled={!clientName || loading} className="flex-1 rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? "..." : "Terminer ✓"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
