import { describe, it, expect } from "vitest";
import {
  calculateTva,
  calculateTotal,
  calculateLineTotal,
  TVA_RATES,
} from "@/lib/utils/tva";

describe("TVA calculations", () => {
  it("calculates TVA at 20%", () => {
    expect(calculateTva(1000, 20)).toBe(200);
  });

  it("calculates TVA at 14%", () => {
    expect(calculateTva(1000, 14)).toBe(140);
  });

  it("calculates TVA at 0%", () => {
    expect(calculateTva(1000, 0)).toBe(0);
  });

  it("rounds correctly to 2 decimals", () => {
    expect(calculateTva(333.33, 20)).toBe(66.67);
  });

  it("calculates total (HT + TVA)", () => {
    expect(calculateTotal(1000, 200)).toBe(1200);
  });

  it("calculates line total", () => {
    expect(calculateLineTotal(5, 200)).toBe(1000);
    expect(calculateLineTotal(2.5, 100)).toBe(250);
  });

  it("line total rounds correctly", () => {
    expect(calculateLineTotal(3, 33.33)).toBe(99.99);
  });

  it("has all Moroccan TVA rates", () => {
    const values = TVA_RATES.map((r) => r.value);
    expect(values).toContain(20);
    expect(values).toContain(14);
    expect(values).toContain(10);
    expect(values).toContain(7);
    expect(values).toContain(0);
  });
});
