"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantSchema, type TenantFormData } from "@/lib/validations/tenant";
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useToastStore } from "@/stores/toast-store";
import { TVA_RATES } from "@/lib/utils/tva";
import { Building, Save } from "lucide-react";

async function fetchTenant() {
  const res = await fetch("/api/v1/tenant");
  if (!res.ok) throw new Error("Erreur chargement paramètres");
  return res.json();
}

async function updateTenant(data: TenantFormData) {
  const res = await fetch("/api/v1/tenant", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur sauvegarde");
  return res.json();
}

const tvaOptions = TVA_RATES.map((r) => ({ value: String(r.value), label: r.label }));
const currencyOptions = [
  { value: "MAD", label: "MAD — Dirham marocain" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "USD", label: "USD — Dollar" },
];

export default function ParametresPage() {
  const addToast = useToastStore((s) => s.addToast);
  const qc = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: fetchTenant,
  });

  const mutation = useMutation({
    mutationFn: updateTenant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant"] });
      addToast({ variant: "success", title: "Paramètres sauvegardés" });
    },
    onError: () => {
      addToast({ variant: "error", title: "Erreur lors de la sauvegarde" });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    values: tenant,
  });

  const tvaRate = watch("tvaRate");
  const currency = watch("currency");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Paramètres</h1>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-600" />
                <CardTitle>Informations légales</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nom de l'entreprise *"
                {...register("name")}
                error={errors.name?.message}
                aria-required="true"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="ICE" {...register("ice")} error={errors.ice?.message} />
                <Input label="IF" {...register("ifNumber")} error={errors.ifNumber?.message} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="RC" {...register("rc")} error={errors.rc?.message} />
                <Input label="CNSS" {...register("cnss")} error={errors.cnss?.message} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
              <Input label="Téléphone" {...register("phone")} error={errors.phone?.message} />
              <Input label="Adresse" {...register("address")} error={errors.address?.message} />
              <Input label="Ville" {...register("city")} error={errors.city?.message} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres de facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Taux TVA par défaut"
                options={tvaOptions}
                value={String(tvaRate ?? 20)}
                onChange={(v) => setValue("tvaRate", Number(v))}
              />
              <Select
                label="Devise"
                options={currencyOptions}
                value={currency ?? "MAD"}
                onChange={(v) => setValue("currency", v)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            isLoading={mutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Sauvegarder les paramètres
          </Button>
        </div>
      </form>
    </div>
  );
}

