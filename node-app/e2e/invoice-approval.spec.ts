
import { test, expect } from "@playwright/test";

test("Manager cannot approve an invoice above 50,000", async ({ page }) => {
  await page.goto("/");

  await page.locator("#username").selectOption("manager");
  await page.locator("#password").fill("manager123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText(/Manager One/)).toBeVisible();

  await page.locator("#amount").fill("50001");
  await page.getByRole("button", { name: "Create Invoice" }).click();

  const invoiceCard = page.locator(".invoice-card").filter({
    hasText: "50,001"
  });

  await expect(invoiceCard).toBeVisible();

  await invoiceCard.getByRole("button", { name: "Approve" }).click();

  await expect(page.locator("#invoiceMessage"))
    .toContainText("not authorized");

  await expect(invoiceCard.locator(".status"))
    .toHaveText("PENDING");
});


test("Invoice above 500,000 requires two distinct approvers", async ({ page }) => {
  await page.goto("/");

  // Login as first approver
  await page.locator("#username").selectOption("director");
  await page.locator("#password").fill("director123");
  await page.getByRole("button", { name: "Login" }).click();

  // Create high-value invoice
  await page.locator("#amount").fill("600000");
  await page.getByRole("button", { name: "Create Invoice" }).click();

  const invoiceCard = page.locator(".invoice-card").filter({
    hasText: "600,000"
  });

  await expect(invoiceCard).toBeVisible();

  // First approval
  await invoiceCard.getByRole("button", { name: "Approve" }).click();

  await expect(invoiceCard.locator(".status")).toHaveText("PENDING");
  await expect(invoiceCard).toContainText("Approvals received: 1");

  // Logout and login as second Director
  await page.locator("#logoutButton").click();

  await page.locator("#username").selectOption("director2");
  await page.locator("#password").fill("director123");
  await page.getByRole("button", { name: "Login" }).click();

  // Second approval
  const secondApprovalCard = page.locator(".invoice-card").filter({
    hasText: "600,000"
  });

  await secondApprovalCard.getByRole("button", { name: "Approve" }).click();

  await expect(secondApprovalCard.locator(".status")).toHaveText("APPROVED");
  await expect(secondApprovalCard).toContainText("Approvals received: 2");
});

