# Implementation Plan: Role-Based Invoice Approval Workflow

**Branch**: `001-role-based-invoice-approval` | **Date**: 2026-11-12 | **Spec**:
[spec.md](./spec.md)

**Input**: Feature specification from `specs/001-role-based-invoice-approval/spec.md`

## Summary

Complete and verify the invoice approval workflow using the existing Node.js, Express, and
TypeScript application. Keep amount and status policy in `ApprovalService`, resolve approver
identity and role only from authentication middleware, and persist approval records in the
existing in-memory repository. Extend approval history to include approver name, role, and
timestamp. Verify threshold, authorization, no-mutation-on-rejection, and two-approver behavior
with Vitest, HTTP integration tests, and Playwright.

## Technical Context

**Language/Version**: TypeScript 6.0.2 on Node.js (runtime version is not pinned in the project)

**Primary Dependencies**: Express 5.3; existing `tsx` development runner

**Storage**: In-memory `InvoiceRepository`; persistence across process restarts is out of scope

**Testing**: Vitest unit and integration tests; Playwright end-to-end tests; Stryker mutation
testing

**Target Platform**: Node.js web service with static browser UI

**Project Type**: Express web application

**Performance Goals**: No feature-specific latency or throughput target is specified; retain
the current in-memory demo behavior

**Constraints**: Strict TypeScript; approval policy belongs in services; approval identity and
role come from authentication middleware; no request-body role may grant privileges; no
explicit invoice-rejection action

**Scale/Scope**: Demo application with Manager and Director roles, one invoice approval flow,
and in-memory sample data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Plan alignment |
|-----------|----------------|
| Layered Domain Boundaries | Keep approval decisions in `ApprovalService`, route handling in controllers, contracts in models, and storage in `InvoiceRepository`. |
| Typed and Validated Boundaries | Preserve strict TypeScript and validate invoice input at the HTTP boundary; ignore untrusted role claims. |
| Tested Business Behavior | Cover role/amount boundaries, invalid paths, state immutability, API authentication, and the complete browser workflow. |
| Approval Integrity and Access Control | Apply approval rules to the authenticated user; record only successful approvals; do not add invoice rejection. |
| Small, Verifiable Changes | Reuse existing dependencies and project layout; run the build and relevant unit, integration, and end-to-end tests. |

**Gate result**: PASS. The feature fits the existing service/repository architecture and
requires no constitution exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-role-based-invoice-approval/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── invoice-approval-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── controllers/
│   ├── authController.ts
│   └── invoiceController.ts
├── middleware/
│   └── authMiddleware.ts
├── models/
│   ├── invoice.ts
│   └── user.ts
├── repositories/
│   └── invoiceRepository.ts
├── services/
│   └── approvalService.ts
├── app.ts
└── server.ts

tests/
├── approvalService.test.ts
├── authController.test.ts
└── invoiceApi.test.ts

e2e/
└── invoice-approval.spec.ts
```

**Structure Decision**: Use the existing single Node application and its established
controllers, middleware, models, repository, service, Vitest tests, and Playwright end-to-end
tests. Add no new runtime components or dependencies.

## Complexity Tracking

No constitution violations or additional architectural complexity are introduced.
