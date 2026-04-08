import { z } from "zod";

export const tenantSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  ice: z.string().max(20).optional().or(z.literal("")),
  ifNumber: z.string().max(20).optional().or(z.literal("")),
  rc: z.string().max(50).optional().or(z.literal("")),
  cnss: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  currency: z.string().default("MAD"),
  tvaRate: z.coerce.number().min(0).max(100).default(20),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
