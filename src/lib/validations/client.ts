import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(200),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  ice: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  type: z.enum(["COMPANY", "INDIVIDUAL"]).default("COMPANY"),
});

export type ClientFormData = z.infer<typeof clientSchema>;
