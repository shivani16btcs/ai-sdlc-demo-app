---
name: invoice-testing
description: "Use when writing or running Vitest, API integration, Playwright end-to-end, or Stryker mutation tests for the Node.js Invoice Approval project."
---

# Invoice Approval Testing

Use this skill to test changes against the active feature's acceptance criteria.

## Read project guidance first

Read the root `AGENTS.md`, `node-app/.specify/memory/constitution.md`, and the active feature
specification, plan, and tasks identified by `node-app/.specify/feature.json`. Treat the
approved specification as the source of truth. Do not weaken tests to hide a business-rule
failure.

## Vitest unit tests

- Put unit tests under `node-app/tests/` in `*.test.ts` files, following existing Vitest
  patterns and `node-app/vitest.config.ts`.
- Test approval policy directly through `ApprovalService` and an isolated
  `InvoiceRepository`.
- Verify allowed and rejected cases, returned status and approval history, and exact
  repository snapshots before and after each rejected attempt.
- Run from `node-app`: `npm test`.
- For focused development, run from `node-app`: `npx vitest run tests/approvalService.test.ts`.

## API integration tests

- Use Vitest with Supertest, following `node-app/tests/invoiceApi.test.ts`.
- Exercise real Express routes, authentication middleware, response status/body, and stored
  state through the app's public HTTP surface.
- Verify missing/invalid authentication, rejection of request-body role or identity claims,
  clear errors, and no mutation after rejected approval attempts.
- Run all API and unit tests from `node-app` with `npm test`.

## Required business-rule coverage

Cover these boundaries and negative cases:

- Manager at 50,000 and Manager rejection at 50,001.
- Director at 50,001 and 500,000.
- Either role as first approver above 500,000, with the invoice remaining `PENDING`.
- A distinct Director as the second approver, changing the invoice to `APPROVED`.
- Manager rejected as second approver; duplicate user and third approval rejected.
- Already-approved and otherwise non-`PENDING` invoices rejected.
- All rejected attempts leave invoice data and approval history unchanged.
- Successful history contains authenticated approver name, role, and timestamp.

## Playwright end-to-end tests

- Follow `node-app/playwright.config.ts` and existing tests under `node-app/e2e/`.
- Verify a complete browser approval journey, including the pending state after the first
  high-value approval and `APPROVED` after a different Director approves.
- Use role-based locators such as `getByRole` and `getByLabel`, consistent with the project
  guidance; do not introduce CSS or XPath selectors.
- From `node-app`, install the browser if needed with `npx playwright install chromium`, then
  run `npm run test:e2e`.

## Stryker mutation testing

- Use the existing `node-app/stryker.config.mjs`, which targets
  `src/services/approvalService.ts`.
- Run from `node-app`: `npm run test:mutation -- --reporters clear-text` to preserve the
  checked-in HTML report.
- Review surviving mutants in approval conditions and thresholds, and add or strengthen
  focused Vitest assertions when a surviving mutant indicates a coverage gap.

## Full verification

From `node-app`, run:

```sh
npm run build
npm test
npm run test:e2e
npm run test:mutation -- --reporters clear-text
```

Report each command's actual result and distinguish test failures from environment or browser
setup failures.
