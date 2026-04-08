"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { Button, Input, Select } from "@/components/ui";
import { TVA_RATES } from "@/lib/utils/tva";
import type { Product } from "@/lib/hooks/use-products";

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

const tvaOptions = TVA_RATES.map((r) => ({ value: String(r.value), label: r.label }));

export function ProductForm({ defaultValues, onSubmit, isLoading }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      unitPrice: defaultValues?.unitPrice ?? 0,
      tvaRate: defaultValues?.tvaRate ?? 20,
      unit: defaultValues?.unit ?? "unité",
      sku: defaultValues?.sku ?? "",
      stockQty: defaultValues?.stockQty ?? 0,
      minStockAlert: defaultValues?.minStockAlert ?? 5,
      category: defaultValues?.category ?? "",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const tvaValue = watch("tvaRate");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label="Nom du produit *"
        {...register("name")}
        error={errors.name?.message}
        aria-required="true"
      />
      <Input
        label="Description"
        {...register("description")}
        error={errors.description?.message}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Prix unitaire (MAD) *"
          type="number"
          step="0.01"
          {...register("unitPrice")}
          error={errors.unitPrice?.message}
          aria-required="true"
        />
        <Select
          label="TVA"
          options={tvaOptions}
          value={String(tvaValue)}
          onChange={(v) => setValue("tvaRate", Number(v))}
          error={errors.tvaRate?.message}
        />
        <Input
          label="Unité"
          {...register("unit")}
          error={errors.unit?.message}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="SKU / Référence"
          {...register("sku")}
          error={errors.sku?.message}
        />
        <Input
          label="Stock disponible"
          type="number"
          {...register("stockQty")}
          error={errors.stockQty?.message}
        />
        <Input
          label="Alerte stock mini"
          type="number"
          {...register("minStockAlert")}
          error={errors.minStockAlert?.message}
        />
      </div>
      <Input
        label="Catégorie"
        {...register("category")}
        error={errors.category?.message}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isLoading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
