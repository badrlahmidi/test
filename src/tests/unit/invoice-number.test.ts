import { describe, it, expect } from "vitest";
import {
  generateInvoiceNumber,
  generateQuoteNumber,
} from "@/lib/utils/invoice-number";

describe("generateInvoiceNumber", () => {
  it("generates correct format FAC-YYYY-NNNN", () => {
    const num = generateInvoiceNumber(1);
    const year = new Date().getFullYear();
    expect(num).toBe(`FAC-${year}-0001`);
  });

  it("pads sequence to 4 digits", () => {
    const year = new Date().getFullYear();
    expect(generateInvoiceNumber(42)).toBe(`FAC-${year}-0042`);
    expect(generateInvoiceNumber(999)).toBe(`FAC-${year}-0999`);
    expect(generateInvoiceNumber(9999)).toBe(`FAC-${year}-9999`);
  });

  it("accepts custom prefix", () => {
    const year = new Date().getFullYear();
    expect(generateInvoiceNumber(1, "PROF")).toBe(`PROF-${year}-0001`);
  });
});

describe("generateQuoteNumber", () => {
  it("generates DEV- prefix", () => {
    const year = new Date().getFullYear();
    expect(generateQuoteNumber(1)).toBe(`DEV-${year}-0001`);
  });
});
