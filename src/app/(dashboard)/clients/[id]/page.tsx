"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import { useToastStore } from "@/stores/toast-store";
import { ArrowLeft, Save } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const isNew = params.id === "nouveau";

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/clients?search=`);
      const json = await res.json();
      return json.data?.find((c: { id: string }) => c.id === params.id) ?? null;
    },
    enabled: !isNew,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    values: client ?? undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const res = await fetch("/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      addToast({ variant: "success", title: "Client enregistré" });
      router.push("/clients");
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
          {isNew ? "Nouveau client" : client?.name ?? "Client"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="grid gap-4 md:grid-cols-2"
          >
            <Input label="Nom *" {...register("name")} error={errors.name?.message} />
            <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
            <Input label="Téléphone" {...register("phone")} error={errors.phone?.message} />
            <Input label="ICE" {...register("ice")} error={errors.ice?.message} />
            <Input label="Adresse" {...register("address")} error={errors.address?.message} />
            <Input label="Ville" {...register("city")} error={errors.city?.message} />
            <Select
              label="Type"
              {...register("type")}
              options={[
                { value: "COMPANY", label: "Entreprise" },
                { value: "INDIVIDUAL", label: "Particulier" },
              ]}
              error={errors.type?.message}
            />

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
