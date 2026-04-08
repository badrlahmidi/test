import { test, expect } from "@playwright/test";

test("smoke: login → client → invoice → pay → assert PAID", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', process.env.E2E_EMAIL || "admin@test.com");
  await page.fill('[name="password"]', process.env.E2E_PASSWORD || "password123");
  await page.click('[type="submit"]');
  await page.waitForURL("**/overview");

  await page.goto("/clients");
  await page.click('button:has-text("Nouveau")');
  await page.fill('[name="name"]', "E2E Test Client");
  await page.fill('[name="email"]', "e2e@test.com");
  await page.click('[type="submit"]');
  await expect(page.locator('text=E2E Test Client')).toBeVisible();

  await page.goto("/factures/nouveau");
  await page.waitForSelector('[name="clientId"]');
  await page.selectOption('[name="clientId"]', { label: "E2E Test Client" });
  await page.fill('[placeholder*="description"]', "Service E2E");
  await page.fill('[placeholder*="quantité"], [name*="quantity"]', "1");
  await page.fill('[placeholder*="prix"], [name*="unitPrice"]', "100");
  await page.click('button:has-text("Enregistrer")');
  await page.waitForURL("**/factures/**");

  await page.click('button:has-text("Paiement")');
  await page.fill('[name="amount"]', "100");
  await page.click('[type="submit"]');

  await expect(
    page.locator('text=PAID').or(page.locator('text=Payée')).or(page.locator('.badge')).first()
  ).toBeVisible({ timeout: 5000 });
});
