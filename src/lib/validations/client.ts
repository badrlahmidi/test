import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  ice: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  type: z.enum(["COMPANY", "INDIVIDUAL"]).default("COMPANY"),
});

export type ClientFormData = z.infer<typeof clientSchema>;
