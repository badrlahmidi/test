"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentFormData } from "@/lib/validations/payment";
import { Button, Input, Select } from "@/components/ui";

interface PaymentFormProps {
  invoiceId: string;
  maxAmount?: number;
  onSubmit: (data: PaymentFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const methodOptions = [
  { value: "CASH", label: "Espèces" },
  { value: "CHECK", label: "Chèque" },
  { value: "TRANSFER", label: "Virement" },
  { value: "CARD", label: "Carte" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "OTHER", label: "Autre" },
];

export function PaymentForm({ invoiceId, maxAmount, onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId,
      amount: maxAmount ?? 0,
      method: "TRANSFER",
      reference: "",
      paidAt: today,
    },
  });

  const method = watch("method");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register("invoiceId")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Montant (MAD) *"
          type="number"
          step="0.01"
          {...register("amount")}
          error={errors.amount?.message}
          aria-required="true"
        />
        <Select
          label="Mode de paiement *"
          options={methodOptions}
          value={method}
          onChange={(v) => setValue("method", v as PaymentFormData["method"])}
          error={errors.method?.message}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date de paiement *"
          type="date"
          {...register("paidAt")}
          error={errors.paidAt?.message}
          aria-required="true"
        />
        <Input
          label="Référence"
          {...register("reference")}
          error={errors.reference?.message}
        />
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          Enregistrer le paiement
        </Button>
      </div>
    </form>
  );
}
