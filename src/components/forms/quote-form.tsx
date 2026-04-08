"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, type QuoteFormData } from "@/lib/validations/quote";
import { Button, Input, Select } from "@/components/ui";
import { TVA_RATES } from "@/lib/utils/tva";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface ClientOption { id: string; name: string }
interface ProductOption { id: string; name: string; unitPrice: number; tvaRate: number }

interface QuoteFormProps {
  defaultValues?: Partial<QuoteFormData>;
  clients: ClientOption[];
  products?: ProductOption[];
  onSubmit: (data: QuoteFormData) => void;
  isLoading?: boolean;
}

const tvaOptions = TVA_RATES.map((r) => ({ value: String(r.value), label: r.label }));

export function QuoteForm({ defaultValues, clients, products = [], onSubmit, isLoading }: QuoteFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: defaultValues?.clientId ?? "",
      issueDate: defaultValues?.issueDate?.slice(0, 10) ?? today,
      validUntil: defaultValues?.validUntil?.slice(0, 10) ?? in30,
      notes: defaultValues?.notes ?? "",
      items: defaultValues?.items ?? [{ description: "", quantity: 1, unitPrice: 0, tvaRate: 20 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");
  const clientId = watch("clientId");

  const totals = watchItems.reduce(
    (acc, item) => {
      const ht = Math.round((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * 100) / 100;
      const tva = Math.round(ht * ((Number(item.tvaRate) || 20) / 100) * 100) / 100;
      return { ht: acc.ht + ht, tva: acc.tva + tva };
    },
    { ht: 0, tva: 0 },
  );

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));

  function handleProductSelect(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.description`, product.name);
      setValue(`items.${index}.unitPrice`, Number(product.unitPrice));
      setValue(`items.${index}.tvaRate`, Number(product.tvaRate));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Client *"
          options={clientOptions}
          value={clientId}
          onChange={(v) => setValue("clientId", v)}
          error={errors.clientId?.message}
        />
        <Input label="Date d'émission *" type="date" {...register("issueDate")} error={errors.issueDate?.message} />
        <Input label="Valide jusqu'au *" type="date" {...register("validUntil")} error={errors.validUntil?.message} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Lignes</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0, tvaRate: 20 })}
          >
            Ajouter
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => {
            const item = watchItems[index];
            const ht = Math.round((Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0) * 100) / 100;
            return (
              <div key={field.id} className="rounded-lg border border-gray-200 p-3">
                {products.length > 0 && (
                  <div className="mb-2">
                    <Select
                      label="Produit (optionnel)"
                      options={[{ value: "", label: "— Sélectionner —" }, ...products.map((p) => ({ value: p.id, label: p.name }))]}
                      value=""
                      onChange={(v) => v && handleProductSelect(index, v)}
                    />
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <Input label="Description *" {...register(`items.${index}.description`)} error={errors.items?.[index]?.description?.message} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="Qté" type="number" step="0.01" {...register(`items.${index}.quantity`)} error={errors.items?.[index]?.quantity?.message} />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="P.U" type="number" step="0.01" {...register(`items.${index}.unitPrice`)} error={errors.items?.[index]?.unitPrice?.message} />
                  </div>
                  <div className="sm:col-span-2">
                    <Select label="TVA" options={tvaOptions} value={String(watchItems[index]?.tvaRate ?? 20)} onChange={(v) => setValue(`items.${index}.tvaRate`, Number(v))} />
                  </div>
                  <div className="flex items-end sm:col-span-1">
                    <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="mb-1 rounded p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-right text-xs text-gray-500">HT: {formatCurrency(ht)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-right">
        <p className="text-sm text-gray-600">Total HT: <span className="font-medium">{formatCurrency(totals.ht)}</span></p>
        <p className="text-sm text-gray-600">TVA: <span className="font-medium">{formatCurrency(totals.tva)}</span></p>
        <p className="text-lg font-bold">Total TTC: {formatCurrency(totals.ht + totals.tva)}</p>
      </div>

      <Input label="Notes" {...register("notes")} error={errors.notes?.message} />

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>Enregistrer</Button>
      </div>
    </form>
  );
}
