"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import { Button, Input, Select } from "@/components/ui";
import type { Client } from "@/lib/hooks/use-clients";

interface ClientFormProps {
  defaultValues?: Partial<Client>;
  onSubmit: (data: ClientFormData) => void;
  isLoading?: boolean;
}

const typeOptions = [
  { value: "COMPANY", label: "Entreprise" },
  { value: "INDIVIDUAL", label: "Particulier" },
];

export function ClientForm({ defaultValues, onSubmit, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      ice: defaultValues?.ice ?? "",
      address: defaultValues?.address ?? "",
      city: defaultValues?.city ?? "",
      type: defaultValues?.type ?? "COMPANY",
    },
  });

  const typeValue = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label="Nom *"
        {...register("name")}
        error={errors.name?.message}
        aria-required="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Téléphone"
          {...register("phone")}
          error={errors.phone?.message}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="ICE"
          {...register("ice")}
          error={errors.ice?.message}
        />
        <Select
          label="Type"
          options={typeOptions}
          value={typeValue}
          onChange={(v) => setValue("type", v as "COMPANY" | "INDIVIDUAL")}
          error={errors.type?.message}
        />
      </div>
      <Input
        label="Adresse"
        {...register("address")}
        error={errors.address?.message}
      />
      <Input
        label="Ville"
        {...register("city")}
        error={errors.city?.message}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isLoading}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
