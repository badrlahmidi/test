/**
 * Generate invoice number in format FAC-YYYY-NNNN
 */
export function generateInvoiceNumber(
  sequence: number,
  prefix: string = "FAC",
): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `${prefix}-${year}-${padded}`;
}

/**
 * Generate quote number in format DEV-YYYY-NNNN
 */
export function generateQuoteNumber(sequence: number): string {
  return generateInvoiceNumber(sequence, "DEV");
}
