import { test, expect } from "@playwright/test";

test("Manager cannot approve an invoice above 50,000", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Username").selectOption("manager");
  await page.getByLabel("Password").fill("manager123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Manager One (MANAGER)")).toBeVisible();

  await page.getByLabel("Invoice Amount").fill("50001");
  await page.getByRole("button", { name: "Create Invoice" }).click();

  const invoiceCard = page
    .getByRole("article")
    .filter({ hasText: "Amount: 50,001" });

  await expect(invoiceCard).toBeVisible();
  await invoiceCard.getByRole("button", { name: "Approve" }).click();

  await expect(page.getByText(/not authorized/i)).toBeVisible();
  await expect(invoiceCard.getByText("PENDING", { exact: true })).toBeVisible();
  await expect(invoiceCard.getByText("Approvals received: 0")).toBeVisible();
});

test("Manager and a distinct Director complete high-value approval", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Username").selectOption("manager");
  await page.getByLabel("Password").fill("manager123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText("Manager One (MANAGER)")).toBeVisible();

  await page.getByLabel("Invoice Amount").fill("600000");
  await page.getByRole("button", { name: "Create Invoice" }).click();

  const invoiceCard = page
    .getByRole("article")
    .filter({ hasText: "Amount: 600,000" });

  await expect(invoiceCard).toBeVisible();
  await invoiceCard.getByRole("button", { name: "Approve" }).click();

  await expect(invoiceCard.getByText("PENDING", { exact: true })).toBeVisible();
  await expect(invoiceCard.getByText("Approvals received: 1")).toBeVisible();
  const approvalHistory = invoiceCard.getByRole("list", {
    name: "Approval history",
  });
  const firstApproval = approvalHistory
    .getByRole("listitem")
    .filter({ hasText: "Manager One (MANAGER)" });
  await expect(firstApproval).toContainText(/approved at .+/i);

  await page.getByRole("button", { name: "Logout" }).click();
  await page.getByLabel("Username").selectOption("director2");
  await page.getByLabel("Password").fill("director123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByText("Director Two (DIRECTOR)")).toBeVisible();

  const secondApprovalCard = page
    .getByRole("article")
    .filter({ hasText: "Amount: 600,000" });
  await secondApprovalCard.getByRole("button", { name: "Approve" }).click();

  await expect(
    secondApprovalCard.getByText("APPROVED", { exact: true }),
  ).toBeVisible();
  await expect(
    secondApprovalCard.getByText("Approvals received: 2"),
  ).toBeVisible();

  const completedHistory = secondApprovalCard.getByRole("list", {
    name: "Approval history",
  });
  const secondApproval = completedHistory
    .getByRole("listitem")
    .filter({ hasText: "Director Two (DIRECTOR)" });
  await expect(firstApproval).toContainText(/approved at .+/i);
  await expect(secondApproval).toContainText(/approved at .+/i);
});
