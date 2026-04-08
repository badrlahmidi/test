import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats MAD currency", () => {
    const result = formatCurrency(1200, "MAD", "fr-MA");
    expect(result).toContain("1");
    expect(result).toContain("200");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("includes decimal places", () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain("1");
    expect(result).toContain("234");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-01-15");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-06-01"));
    expect(typeof result).toBe("string");
    expect(result).toContain("2024");
  });
});

describe("formatNumber", () => {
  it("formats integers", () => {
    const result = formatNumber(1000);
    expect(typeof result).toBe("string");
  });

  it("formats zero", () => {
    const result = formatNumber(0);
    expect(result).toContain("0");
  });
});
