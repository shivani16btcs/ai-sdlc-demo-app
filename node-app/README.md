# Node.js Invoice Approval

This folder contains a separate invoice-approval demo built with Node.js, Express,
TypeScript, and a small static browser UI. The approved requirements and design live in
[the feature specification](specs/001-role-based-invoice-approval/spec.md).

## Prerequisites

- Node.js and npm.
- Install dependencies from this directory:

```sh
npm ci
```

For browser tests, install Chromium once:

```sh
npx playwright install chromium
```

## Run the application

```sh
npm run dev
```

Open <http://localhost:3000>. The UI offers demo Manager and Director accounts. Authentication
and invoice data are in-memory demo behavior, not production identity or durable storage.

## Build and tests

Run from this directory:

```sh
npm run build
npm test
npx playwright install chromium
npm run test:e2e
npm run test:mutation -- --reporters clear-text
```

- `npm run build` type-checks and compiles the TypeScript API.
- `npm test` runs Vitest service, authentication, and API tests.
- `npm run test:e2e` runs Playwright against the local app.
- `npm run test:mutation -- --reporters clear-text` runs Stryker against the approval service
  without overwriting the checked-in HTML report.

## Project layout

- `src/controllers/`: Express endpoints and HTTP response handling.
- `src/services/`: invoice approval business rules.
- `src/repositories/`: in-memory invoice storage.
- `src/models/`: typed invoice, approval, and user contracts.
- `src/middleware/`: authentication and trusted caller identity.
- `tests/`: Vitest unit and API integration tests.
- `e2e/`: Playwright browser tests.
- `public/`: static invoice approval interface.
- `.github/agents/` and `.github/skills/`: project-specific Copilot customizations.
- The repository-root `.github/hooks/node-quality-check.json`: a Copilot `subagentStop` hook
  that runs build and Vitest checks when the invoice implementation custom agent completes.
- `.specify/memory/constitution.md`: Node app engineering principles.
- `specs/001-role-based-invoice-approval/`: approved feature, plan, tasks, and design artifacts.

See [quickstart validation](specs/001-role-based-invoice-approval/quickstart.md) for the
approval scenarios and expected outcomes.

The hook configuration and script are validated as files; the hook must still be exercised
in a trusted Copilot session before relying on its runtime behavior.
