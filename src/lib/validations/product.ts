import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0, "Le prix doit être positif"),
  tvaRate: z.coerce.number().min(0).max(100).default(20),
  unit: z.string().trim().min(1).max(50).default("unité"),
  sku: z.string().trim().max(50).optional().or(z.literal("")),
  stockQty: z.coerce.number().int().min(0).default(0),
  minStockAlert: z.coerce.number().int().min(0).default(5),
  category: z.string().trim().max(100).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;
