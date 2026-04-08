"use client";

import { useParams, useRouter } from "next/navigation";
import { useProduct, useCreateProduct, useUpdateProduct } from "@/lib/hooks/use-products";
import { ProductForm } from "@/components/forms/product-form";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, SkeletonCard } from "@/components/ui";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import type { ProductFormData } from "@/lib/validations/product";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const id = params.id as string;
  const isNew = id === "nouveau";

  const { data: product, isLoading } = useProduct(isNew ? "" : id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  async function handleSubmit(data: ProductFormData) {
    try {
      if (isNew) {
        await createProduct.mutateAsync(data);
        addToast({ variant: "success", title: "Produit créé" });
      } else {
        await updateProduct.mutateAsync({ id, data });
        addToast({ variant: "success", title: "Produit mis à jour" });
      }
      router.push("/produits");
    } catch {
      addToast({ variant: "error", title: "Erreur lors de l'enregistrement" });
    }
  }

  if (isLoading && !isNew) {
    return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  }

  const isLowStock =
    product && Number(product.stockQty) <= Number(product.minStockAlert);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Retour">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Nouveau produit" : (product?.name ?? "Produit")}
        </h1>
        {isLowStock && (
          <Badge variant="danger" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Stock faible
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations produit</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            defaultValues={product ?? undefined}
            onSubmit={handleSubmit}
            isLoading={createProduct.isPending || updateProduct.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
