import { z } from "zod";

export const expenseCategories = [
  "ACHAT_MATERIEL",
  "LOYER",
  "SALAIRES",
  "TRANSPORT",
  "COMMUNICATION",
  "SOUS_TRAITANCE",
  "FOURNITURES",
  "MARKETING",
  "TAXES",
  "AUTRE",
] as const;

export const expenseCategoryLabels: Record<string, string> = {
  ACHAT_MATERIEL: "Achat matériel",
  LOYER: "Loyer",
  SALAIRES: "Salaires",
  TRANSPORT: "Transport",
  COMMUNICATION: "Communication",
  SOUS_TRAITANCE: "Sous-traitance",
  FOURNITURES: "Fournitures",
  MARKETING: "Marketing",
  TAXES: "Taxes & impôts",
  AUTRE: "Autre",
};

export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Le libellé est requis").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  amount: z.coerce.number().positive("Le montant doit être positif"),
  category: z.enum(expenseCategories).default("AUTRE"),
  reference: z.string().trim().max(100).optional().or(z.literal("")),
  expenseDate: z.string().min(1, "La date est requise"),
});

export const expenseUpdateSchema = expenseSchema.partial();

export type ExpenseFormData = z.infer<typeof expenseSchema>;
