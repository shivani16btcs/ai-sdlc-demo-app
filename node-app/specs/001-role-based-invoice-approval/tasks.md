# Tasks: Role-Based Invoice Approval Workflow

**Input**: Design documents from `specs/001-role-based-invoice-approval/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, and
`contracts/invoice-approval-api.md`

**Tests**: Included because the specification requires Vitest unit/integration tests and
Playwright end-to-end coverage.

**Organization**: Tasks are grouped by user story. The existing project already contains
the application structure, middleware, and test tooling; this plan adds no dependencies.

## Phase 1: Setup

**Purpose**: Verify the existing project tooling needed by the feature.

- [x] T001 Confirm `node-app/package.json`, `node-app/vitest.config.ts`, `node-app/playwright.config.ts`, and `node-app/stryker.config.mjs` provide the build, Vitest, Playwright, and Stryker commands referenced in `specs/001-role-based-invoice-approval/quickstart.md`; do not add dependencies.

## Phase 2: Foundational

**Purpose**: Shared infrastructure required before story implementation.

The existing Express app, in-memory repository, TypeScript models, and authentication
middleware already provide the foundation. No additional blocking infrastructure tasks are
needed.

---

## Phase 3: User Story 1 - Approve invoices within role limits (Priority: P1) 🎯 MVP

**Goal**: Enforce role-specific amount limits and record successful approvals, including
either role's first approval of an invoice above 500,000.

**Independent Test**: Unit-test 50,000, 50,001, 500,000, and 500,001 with Manager and
Director users; verify status, authorization, and recorded approver details.

### Tests for User Story 1

> Write tests first and confirm they fail before implementation.

- [x] T002 [US1] Add service tests in `node-app/tests/approvalService.test.ts` for Manager approval at 50,000 and rejection at 50,001, Director approval at 50,001 and 500,000, and first approval by either role at 500,001; assert expected status, approval count, and approver identity, name, role, and timestamp.

### Implementation for User Story 1

- [x] T003 [US1] Add required `approverName: string` to the `Approval` interface in `node-app/src/models/invoice.ts`, matching the data-model requirement that the authenticated user's name is copied into each successful approval.
- [x] T004 [US1] Update `ApprovalService.recordApproval` in `node-app/src/services/approvalService.ts` to record `user.name` with the authenticated user's ID, role, and service-generated timestamp while enforcing the specified amount boundaries.

**Checkpoint**: Unit tests pass for each threshold and first-approver role; successful
approvals include all required history details.

---

## Phase 4: User Story 2 - Complete high-value approval (Priority: P1)

**Goal**: Require a distinct Director's second approval above 500,000, reject invalid
additional approvals without changing invoice history, and show approval details to users.

**Independent Test**: Record a first approval on a high-value invoice, then verify a distinct
Director completes approval while duplicate, Manager-second, and third approval attempts
produce errors and leave the invoice unchanged.

### Tests for User Story 2

> Write tests first and confirm they fail before implementation.

- [x] T005 [US2] Add service tests in `node-app/tests/approvalService.test.ts` for a distinct Director completing the second approval, Manager rejection as second approver, duplicate approver rejection, third approval rejection, and approval attempts against already APPROVED or otherwise non-PENDING invoices; compare stored invoice snapshots after every rejection.

### Implementation for User Story 2

- [x] T006 [US2] Update `ApprovalService.approve` in `node-app/src/services/approvalService.ts` as needed so only a different Director can complete a high-value invoice, an already-approved or otherwise non-PENDING invoice returns a clear error, and invalid attempts never update the repository.
- [x] T007 [P] [US2] Update `renderInvoices` in `node-app/public/app.js` to display each approval's approver name, role, and timestamp from the invoice approval history.

**Checkpoint**: A high-value invoice stays PENDING after one approval, becomes APPROVED
after a distinct Director's second approval, and renders both approval records.

---

## Phase 5: User Story 3 - Protect approval actions with authenticated identity (Priority: P1)

**Goal**: Ensure approval uses only the identity and role established by authentication and
verify the complete protected workflow through the API and browser.

**Independent Test**: Verify unauthenticated attempts are denied, a Manager cannot elevate
privileges by submitting a Director role, and two authenticated distinct users can complete
the high-value browser workflow.

### Tests for User Story 3

> Write tests first and confirm they fail before implementation.

- [x] T008 [P] [US3] Add API tests in `node-app/tests/invoiceApi.test.ts` for missing and invalid bearer tokens, a Manager submitting a Director role in the request body for a 50,001 invoice, and the authenticated approver's name, role, and timestamp in a successful response; verify rejected requests leave the invoice unchanged.
- [x] T009 [P] [US3] Extend `node-app/e2e/invoice-approval.spec.ts` to complete the browser workflow with a Manager as first approver of an invoice above 500,000 and a different Director as second approver; assert the pending-to-approved transition and both approval-history entries using role-based locators, not CSS or XPath selectors.

### Implementation for User Story 3

- [x] T010 [US3] Update `node-app/src/controllers/invoiceController.ts` or `node-app/src/middleware/authMiddleware.ts` only as needed to ensure the approve route passes the middleware-authenticated user to the service, ignores body-supplied identity and role, returns clear errors, and preserves invoice state on rejection. Existing middleware/controller behavior was verified by API tests; no production change was needed.

**Checkpoint**: API tests demonstrate that request-body roles cannot grant authority, and
the Playwright workflow verifies the complete authenticated two-approver journey.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Run all required validation and keep the feature's run guide accurate.

- [x] T011 Run `npm run build`, `npm test`, and `npm run test:e2e` from `node-app`; fix failures in the relevant `node-app/src/`, `node-app/tests/`, or `node-app/e2e/` files.
- [x] T012 [P] Run `npm run test:mutation` from `node-app` and review Stryker results for `node-app/src/services/approvalService.ts`; update the relevant service tests in `node-app/tests/approvalService.test.ts` if approval-rule mutants survive. Final run: 35 mutants killed, 26 rejected by the TypeScript checker as compile errors, 0 timeouts, 0 survivors; reported mutation score 100% for scoreable mutants.
- [x] T013 [P] Update `node-app/specs/001-role-based-invoice-approval/quickstart.md` if the final test commands or expected approval-history behavior differ from the implemented workflow.

## Execution Note

The final service, API, and browser tests are implemented and pass. The implementation
subagent confirmed it edited the model/service before expanding the tests and did not capture
a pre-implementation failing (red) run. Therefore, the final passing tests are verified, but
this work is not evidence that the planned test-first sequence was followed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; verify the existing toolchain.
- **Foundational (Phase 2)**: No code tasks; existing application and test infrastructure
  already satisfy prerequisites.
- **User Stories (Phases 3–5)**: Depend on the setup check and existing foundation.
- **Polish (Phase 6)**: Depends on the desired user stories being implemented.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after setup; establishes the approval-history model field
  used by subsequent story work.
- **User Story 2 (P1)**: Depends on User Story 1's approval record shape and service behavior.
- **User Story 3 (P1)**: Depends on the approval service and response shape from User Story 1;
  its browser test also exercises User Story 2's second-approval path.

### Within Each User Story

- Write and run the story's tests before implementation.
- Complete model changes before service code that records the model.
- Complete the service behavior before the UI and end-to-end validation that consume it.
- Keep each story independently testable at its checkpoint.

### Parallel Opportunities

- T007 can proceed in parallel with T006 after T005 defines the approval-history expectations;
  they modify different files.
- T008 and T009 can be authored in parallel after User Story 1 defines the approval response
  shape; they modify separate test files.
- T012 and T013 can proceed in parallel after all implementation changes are complete.
- The user stories are not fully parallelizable because they build on the approval record and
  service behavior introduced in User Story 1.

## Parallel Example: User Story 3

```text
Task: T008 API authentication and response tests in node-app/tests/invoiceApi.test.ts
Task: T009 Browser approval workflow in node-app/e2e/invoice-approval.spec.ts
```

## Implementation Strategy

### MVP First (User Story 1)

1. Verify the existing project and testing commands (T001).
2. Add failing boundary and approval-history tests (T002).
3. Add the approval name field and service recording behavior (T003–T004).
4. Validate User Story 1 independently at all specified amount boundaries.

### Incremental Delivery

1. Complete User Story 1 to deliver role and amount checks with approval records.
2. Complete User Story 2 to enforce distinct second approval and show history.
3. Complete User Story 3 to verify authentication at the API boundary and complete browser
   workflow.
4. Run all validation commands and mutation analysis.
