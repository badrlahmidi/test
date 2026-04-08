import { describe, it, expect } from "vitest";
import { clientSchema } from "@/lib/validations/client";
import { productSchema } from "@/lib/validations/product";
import { invoiceSchema } from "@/lib/validations/invoice";
import { quoteSchema } from "@/lib/validations/quote";
import { paymentSchema } from "@/lib/validations/payment";
import { tenantSchema } from "@/lib/validations/tenant";

describe("clientSchema", () => {
  it("validates a complete client", () => {
    const result = clientSchema.safeParse({
      name: "Alpha SARL",
      email: "contact@alpha.ma",
      phone: "0522000000",
      ice: "001234567890123",
      type: "COMPANY",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = clientSchema.safeParse({ name: "", type: "COMPANY" });
    expect(result.success).toBe(false);
  });

  it("validates email format", () => {
    const result = clientSchema.safeParse({ name: "Test", email: "not-an-email", type: "COMPANY" });
    expect(result.success).toBe(false);
  });
});

describe("productSchema", () => {
  it("validates a product", () => {
    const result = productSchema.safeParse({
      name: "Laptop",
      unitPrice: 5000,
      tvaRate: 20,
      unit: "pièce",
      stockQty: 10,
      minStockAlert: 2,
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = productSchema.safeParse({ unitPrice: 100 });
    expect(result.success).toBe(false);
  });

  it("rejects negative unit price", () => {
    const result = productSchema.safeParse({
      name: "Test",
      unitPrice: -100,
      tvaRate: 20,
      unit: "pièce",
    });
    expect(result.success).toBe(false);
  });
});

describe("invoiceSchema", () => {
  it("validates a minimal invoice", () => {
    const result = invoiceSchema.safeParse({
      clientId: "client-id-123",
      issueDate: "2024-01-01",
      dueDate: "2024-02-01",
      items: [{ description: "Service", quantity: 1, unitPrice: 1000, tvaRate: 20 }],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one item", () => {
    const result = invoiceSchema.safeParse({
      clientId: "client-id-123",
      issueDate: "2024-01-01",
      dueDate: "2024-02-01",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("requires clientId", () => {
    const result = invoiceSchema.safeParse({
      clientId: "",
      issueDate: "2024-01-01",
      dueDate: "2024-02-01",
      items: [{ description: "Service", quantity: 1, unitPrice: 1000 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("quoteSchema", () => {
  it("validates a quote", () => {
    const result = quoteSchema.safeParse({
      clientId: "client-id-123",
      issueDate: "2024-01-01",
      validUntil: "2024-02-01",
      items: [{ description: "Produit", quantity: 2, unitPrice: 500, tvaRate: 20 }],
    });
    expect(result.success).toBe(true);
  });
});

describe("paymentSchema", () => {
  it("validates a payment", () => {
    const result = paymentSchema.safeParse({
      invoiceId: "inv-id-123",
      amount: 1200,
      method: "TRANSFER",
      paidAt: "2024-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = paymentSchema.safeParse({
      invoiceId: "inv-id-123",
      amount: 0,
      method: "CASH",
      paidAt: "2024-01-15",
    });
    expect(result.success).toBe(false);
  });
});

describe("tenantSchema", () => {
  it("validates a tenant", () => {
    const result = tenantSchema.safeParse({
      name: "Ma Société SARL",
      currency: "MAD",
      tvaRate: 20,
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = tenantSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
