import { z } from "zod";
import { invoiceItemSchema } from "./invoice";

export const quoteSchema = z.object({
  clientId: z.string().min(1, "Le client est requis"),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  validUntil: z.string().min(1, "La date de validité est requise"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(invoiceItemSchema).min(1, "Au moins une ligne est requise"),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
