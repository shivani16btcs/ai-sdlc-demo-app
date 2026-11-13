---
name: typescript-development
description: "Use when implementing or refactoring the Node.js Invoice Approval app in TypeScript, including its controllers, services, repositories, models, and middleware."
---

# TypeScript Development

Use this skill for Node app implementation and code review.

## Read project guidance first

Read the root `AGENTS.md`, `node-app/.specify/memory/constitution.md`, and the active feature
specification, plan, and tasks linked by `node-app/.specify/feature.json`. The approved
specification governs business behavior. If guidance conflicts or a material requirement is
unclear, surface the conflict instead of choosing a new behavior.

## Coding standards

- Use strict TypeScript and preserve the existing compiler settings in `node-app/tsconfig.json`.
- Define and reuse typed interfaces and domain types in `node-app/src/models/`. Avoid
  unnecessary casts, `any`, and untyped request data.
- Validate and narrow values received from HTTP requests before using them or changing state.
- Use clear, descriptive names and follow the existing ESM import convention, including `.js`
  extensions on TypeScript source imports.
- Keep changes focused, readable, and consistent with existing formatting and helpers.
- Do not add a dependency or abstraction when existing project capabilities are sufficient.

## Architecture

- Keep approval policy and invoice lifecycle decisions in `node-app/src/services/`.
- Keep HTTP parsing, validation, status codes, and response formatting in
  `node-app/src/controllers/`; controllers must delegate business decisions to services.
- Keep persistence access in `node-app/src/repositories/`; keep shared domain contracts in
  `node-app/src/models/`; keep identity resolution in `node-app/src/middleware/`.
- Preserve the established in-memory repository unless the approved scope explicitly changes
  storage.
- Approval identity and role must come from authenticated middleware context. Never trust a
  role or identity in the request body.
- Rejected operations must not mutate invoice state. Do not add an invoice-rejection action
  unless the approved specification is updated.

## Verification

Write or update appropriate Vitest tests for every new or changed rule or endpoint. Run
`npm run build` and `npm test` from `node-app`; run `npm run test:e2e` for changes to the
user-facing invoice workflow.
