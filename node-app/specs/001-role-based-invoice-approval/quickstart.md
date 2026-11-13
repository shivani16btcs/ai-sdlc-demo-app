# Quickstart: Validate Invoice Approval

Run commands from the `node-app` directory.

## Prerequisites

- Node.js and npm installed.
- Install project dependencies with `npm ci`.
- For browser tests, Playwright Chromium installed with `npx playwright install chromium`.

## Start the application

```powershell
npm run dev
```

Open `http://localhost:3000`. The app uses demo authentication and an in-memory invoice
repository; it is not a production identity or persistence system.

## Build and unit/integration tests

```powershell
npm run build
npm test
```

Expected: TypeScript builds without errors and Vitest passes service, authentication, and
invoice API tests. The Vitest command includes both unit and API integration tests.

## End-to-end workflow

```powershell
npx playwright install chromium
npm run test:e2e
```

Playwright starts the app using the configured development server. Expected: browser tests
verify that a Manager cannot approve an invoice above 50,000 and that a high-value invoice
remains PENDING after its first approval and becomes APPROVED after a distinct Director's
second approval. Approval history should show each approver's name, role, and timestamp.

## Required behavior checks

Confirm automated coverage includes:

1. Manager approval at 50,000 and rejection at 50,001.
2. Director approval at 50,001 and 500,000.
3. High-value (`>500,000`) first approval by either role, with status remaining PENDING.
4. Second approval by a different Director; reject a Manager as second approver.
5. Duplicate approver, third approval, non-PENDING invoice, and unauthenticated attempts.
6. Every rejected attempt leaves the stored invoice and approval history unchanged.
7. Approval history exposes the approver name, role, and approval time.
8. The browser workflow completes the two-approver path.

## Optional mutation check

```powershell
npm run test:mutation -- --reporters clear-text
```

Expected: Stryker runs the configured mutation analysis against
`src/services/approvalService.ts` without overwriting the checked-in HTML report.
