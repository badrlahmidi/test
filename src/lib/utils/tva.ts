/** Moroccan TVA rates */
export const TVA_RATES = [
  { value: 20, label: "20% (Standard)" },
  { value: 14, label: "14%" },
  { value: 10, label: "10%" },
  { value: 7, label: "7%" },
  { value: 0, label: "0% (Exonéré)" },
] as const;

export type TvaRate = (typeof TVA_RATES)[number]["value"];

export function calculateTva(subtotal: number, rate: number): number {
  return Math.round(subtotal * (rate / 100) * 100) / 100;
}

export function calculateTotal(subtotal: number, tvaAmount: number): number {
  return Math.round((subtotal + tvaAmount) * 100) / 100;
}

export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}
