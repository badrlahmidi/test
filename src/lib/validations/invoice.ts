import { z } from "zod";

export const invoiceItemSchema = z.object({
  productId: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "La description est requise"),
  quantity: z.coerce.number().min(0.01, "La quantité doit être positive"),
  unitPrice: z.coerce.number().min(0, "Le prix doit être positif"),
  tvaRate: z.coerce.number().min(0).max(100).default(20),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Le client est requis"),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  dueDate: z.string().min(1, "La date d'échéance est requise"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(invoiceItemSchema).min(1, "Au moins une ligne est requise"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
