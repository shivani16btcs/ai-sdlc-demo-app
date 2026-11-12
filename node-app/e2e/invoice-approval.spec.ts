import { expect, test } from "@playwright/test";

test("Manager cannot approve an invoice above 50,000", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Username").selectOption("manager");
  await page.getByLabel("Password").fill("manager123");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByLabel("Invoice Amount").fill("50001");
  await page.getByRole("button", { name: "Create Invoice" }).click();

  const invoiceCard = page.getByRole("article").filter({ hasText: "50,001" });
  await expect(invoiceCard).toBeVisible();
  await invoiceCard.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText(/not authorized/i)).toBeVisible();
  await expect(invoiceCard.getByText("PENDING", { exact: true })).toBeVisible();
});

test("a single Manager can approve a high-value invoice", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Username").selectOption("manager");
  await page.getByLabel("Password").fill("manager123");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByLabel("Invoice Amount").fill("600000");
  await page.getByRole("button", { name: "Create Invoice" }).click();

  const invoiceCard = page.getByRole("article").filter({ hasText: "600,000" });
  await expect(invoiceCard).toBeVisible();
  await invoiceCard.getByRole("button", { name: "Approve" }).click();

  await expect(invoiceCard.getByText("APPROVED", { exact: true })).toBeVisible();
  await expect(
    invoiceCard.getByRole("list", { name: "Approval history" }).getByText(
      /Manager One \(MANAGER\).*approved at/,
    ),
  ).toBeVisible();
});
