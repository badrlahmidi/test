"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { TVA_RATES } from "@/lib/utils/tva";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft, Save } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const isNew = params.id === "nouveau";

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/produits?search=`);
      const json = await res.json();
      return json.data?.find((p: { id: string }) => p.id === params.id) ?? null;
    },
    enabled: !isNew,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    values: product ?? undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const res = await fetch("/api/v1/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
      addToast({ variant: "success", title: "Produit enregistré" });
      router.push("/produits");
    },
    onError: () => {
      addToast({ variant: "error", title: "Erreur lors de l'enregistrement" });
    },
  });

  if (isLoading && !isNew) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Nouveau produit" : product?.name ?? "Produit"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations produit</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="grid gap-4 md:grid-cols-2"
          >
            <Input label="Nom *" {...register("name")} error={errors.name?.message} />
            <Input label="SKU" {...register("sku")} error={errors.sku?.message} />
            <Input label="Prix unitaire (MAD) *" type="number" step="0.01" {...register("unitPrice")} error={errors.unitPrice?.message} />
            <Select
              label="Taux TVA"
              {...register("tvaRate")}
              options={TVA_RATES.map((r) => ({
                value: String(r.value),
                label: r.label,
              }))}
              error={errors.tvaRate?.message}
            />
            <Input label="Unité" {...register("unit")} error={errors.unit?.message} />
            <Input label="Catégorie" {...register("category")} error={errors.category?.message} />
            <Input label="Stock actuel" type="number" {...register("stockQty")} error={errors.stockQty?.message} />
            <Input label="Alerte stock minimum" type="number" {...register("minStockAlert")} error={errors.minStockAlert?.message} />
            <div className="md:col-span-2">
              <Input label="Description" {...register("description")} error={errors.description?.message} />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                isLoading={mutation.isPending}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
