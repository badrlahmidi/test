import { z } from "zod";

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "La facture est requise"),
  amount: z.coerce.number().min(0.01, "Le montant doit être positif"),
  method: z.enum(["CASH", "CHECK", "TRANSFER", "CARD", "MOBILE_MONEY", "OTHER"]),
  reference: z.string().max(200).optional().or(z.literal("")),
  paidAt: z.string().min(1, "La date de paiement est requise"),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
