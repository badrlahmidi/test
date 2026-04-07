"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations/invoice";
import { TVA_RATES } from "@/lib/utils/tva";
import { calculateLineTotal } from "@/lib/utils/tva";
import { formatCurrency } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export default function NouvelleFacturePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data: clientsData } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const res = await fetch("/api/v1/clients?pageSize=100");
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      items: [{ description: "", quantity: 1, unitPrice: 0, tvaRate: 20 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const subtotal = watchedItems?.reduce(
    (sum, item) => sum + calculateLineTotal(Number(item?.quantity || 0), Number(item?.unitPrice || 0)),
    0,
  ) ?? 0;
  const tvaAmount = watchedItems?.reduce(
    (sum, item) => {
      const lineTotal = calculateLineTotal(Number(item?.quantity || 0), Number(item?.unitPrice || 0));
      return sum + lineTotal * (Number(item?.tvaRate || 20) / 100);
    },
    0,
  ) ?? 0;
  const total = subtotal + tvaAmount;

  const mutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const res = await fetch("/api/v1/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      addToast({ variant: "success", title: "Facture créée" });
      router.push("/factures");
    },
    onError: () => {
      addToast({ variant: "error", title: "Erreur lors de la création" });
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle facture</h1>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Select
                label="Client *"
                {...register("clientId")}
                options={
                  clientsData?.data?.map((c: { id: string; name: string }) => ({
                    value: c.id,
                    label: c.name,
                  })) ?? []
                }
                placeholder="Sélectionner..."
                error={errors.clientId?.message}
              />
              <Input label="Date d'émission *" type="date" {...register("issueDate")} error={errors.issueDate?.message} />
              <Input label="Date d'échéance *" type="date" {...register("dueDate")} error={errors.dueDate?.message} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total HT</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">TVA</span>
                <span>{formatCurrency(tvaAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lignes</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0, tvaRate: 20 })}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            {errors.items?.root && (
              <p className="mb-4 text-sm text-red-600">{errors.items.root.message}</p>
            )}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <Input
                      label="Description *"
                      {...register(`items.${index}.description`)}
                      error={errors.items?.[index]?.description?.message}
                    />
                  </div>
                  <Input
                    label="Quantité"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.quantity`)}
                    error={errors.items?.[index]?.quantity?.message}
                  />
                  <Input
                    label="Prix unitaire"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`)}
                    error={errors.items?.[index]?.unitPrice?.message}
                  />
                  <div className="flex items-end gap-2">
                    <Select
                      label="TVA"
                      {...register(`items.${index}.tvaRate`)}
                      options={TVA_RATES.map((r) => ({
                        value: String(r.value),
                        label: r.label,
                      }))}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="mb-0.5 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" isLoading={mutation.isPending} leftIcon={<Save className="h-4 w-4" />}>
            Créer la facture
          </Button>
        </div>
      </form>
    </div>
  );
}
