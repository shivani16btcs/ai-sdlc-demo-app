# Feature Specification: Role-Based Invoice Approval Workflow

**Feature Branch**: `001-role-based-invoice-approval`

**Created**: 2026-11-12

**Status**: Draft

**Input**: User description: "Build a role-based invoice approval system with Manager and Director roles, amount-based approval limits, distinct approvers for invoices above 500,000, authenticated role determination, and tested approval workflows."

## Clarifications

### Session 2026-11-12

- Q: For invoices above 500,000, who can provide the first approval? → A: Either a Manager or a Director; the second approval must come from a different Director.
- Q: What should happen when someone tries to approve an invoice that is already APPROVED? → A: Reject the attempt with a clear error and leave the invoice and its approval history unchanged.
- Q: Should users be able to explicitly reject a PENDING invoice, or should this feature only reject unauthorized approval attempts? → A: This feature has no explicit invoice-rejection action; it only rejects invalid approval attempts.
- Q: What information should each invoice approval record show in its history? → A: Approver name, role, and timestamp.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Approve invoices within role limits (Priority: P1)

A Manager or Director reviews a pending invoice and approves it when their role is permitted
for its amount. This lets ordinary invoices proceed without unnecessary approval steps.

**Why this priority**: Role and amount authorization is the foundation of the approval
workflow.

**Independent Test**: Create pending invoices at the approval thresholds and attempt approval
as each role; verify the resulting status and approval record, or a clear rejection.

**Acceptance Scenarios**:

1. **Given** a pending invoice for 50,000, **When** a Manager approves it, **Then** it becomes
   APPROVED and records that Manager's approval.
2. **Given** a pending invoice for 50,001, **When** a Manager attempts approval, **Then** the
   attempt is rejected with a clear error and invoice data remains unchanged.
3. **Given** a pending invoice for 50,001 or 500,000, **When** a Director approves it,
   **Then** it becomes APPROVED and records that Director's approval.
4. **Given** a pending invoice for 500,001 with no approvals, **When** a Manager or Director
   approves it, **Then** it remains PENDING and records one approval.

---

### User Story 2 - Complete high-value approval (Priority: P1)

A second, distinct approver who is a Director reviews an invoice above 500,000 after its first
approval. The invoice is approved only when this second approval is recorded.

**Why this priority**: High-value invoices require an additional independent control before
they can be approved.

**Independent Test**: Submit an invoice above 500,000 through two different approver identities,
then verify the pending state after the first approval and approved state after the second.

**Acceptance Scenarios**:

1. **Given** a pending invoice above 500,000 with one approval, **When** a different Director
   approves it, **Then** it becomes APPROVED and contains both approval records with each
   approver's name, role, and approval time.
2. **Given** a pending invoice above 500,000 with one approval, **When** a Manager attempts to
   provide the second approval, **Then** the attempt is rejected and invoice data is unchanged.
3. **Given** an invoice already approved by a user, **When** that same user attempts another
   approval, **Then** the attempt is rejected and invoice data is unchanged.
4. **Given** an invoice above 500,000 with two approvals, **When** another user attempts a
   third approval, **Then** the attempt is rejected and invoice data is unchanged.

---

### User Story 3 - Protect approval actions with authenticated identity (Priority: P1)

An approver signs in and approves an invoice using the identity and role established by the
trusted authentication context. A requester cannot gain approval privileges by submitting a
different role in the request.

**Why this priority**: Approval limits are meaningful only when applied to the authenticated
approver rather than a role claimed by the requester.

**Independent Test**: Attempt approval without valid authentication and with a request claiming
a more privileged role; verify the unauthenticated attempt is denied and the claimed role does
not change the authenticated user's permissions or invoice data.

**Acceptance Scenarios**:

1. **Given** an unauthenticated request, **When** it attempts to approve an invoice, **Then**
   the approval is denied and invoice data remains unchanged.
2. **Given** an authenticated Manager who submits a request claiming to be a Director,
   **When** the Manager attempts to approve an invoice for 50,001, **Then** the attempt is
   rejected according to the authenticated Manager role and invoice data remains unchanged.
3. **Given** a non-pending invoice, **When** any authenticated user attempts to approve it,
   **Then** the attempt is rejected and invoice data remains unchanged.

### Edge Cases

- An amount exactly equal to 50,000 is within the Manager limit; an amount of 50,001 is not.
- An amount exactly equal to 500,000 is within the single-Director limit; an amount of
  500,001 requires two approvals. Either role may provide the first approval above 500,000.
- A high-value invoice remains PENDING after exactly one approval, whether the first approver
  is a Manager or a Director.
- A repeated approval by the same identity is rejected even if the request claims a different
  role.
- A Manager cannot provide the second approval for a high-value invoice.
- An approval attempt on an already APPROVED invoice is rejected with a clear error and
  leaves the invoice and approval history unchanged.
- Each recorded approval shows the approver's name, role, and approval time.
- No approval attempt may add, remove, or alter invoice data when it is rejected.
- An invoice that is not PENDING cannot receive an approval.
- This feature does not provide an action for an approver to reject an invoice; rejection
  refers only to an invalid approval attempt.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support Manager and Director approver roles.
- **FR-002**: The system MUST allow a Manager to approve a PENDING invoice with an amount of
  50,000 or less.
- **FR-003**: The system MUST reject a Manager's approval attempt for an invoice above 50,000
  with a clear error.
- **FR-004**: The system MUST allow a Director to approve a PENDING invoice above 50,000 and
  up to and including 500,000.
- **FR-005**: An invoice above 500,000 MUST allow either a Manager or a Director to provide
  the first approval and MUST require a second approval from a different user before it
  becomes APPROVED.
- **FR-006**: After the first approval of an invoice above 500,000, the system MUST keep the
  invoice PENDING.
- **FR-007**: For an invoice above 500,000, the second approver MUST be a Director.
- **FR-008**: The system MUST reject a repeated approval from the same user for the same
  invoice, regardless of any role claimed in the request.
- **FR-009**: The system MUST reject a third approval for a high-value invoice that already
  has two approvals.
- **FR-010**: The system MUST permit approvals only while an invoice is PENDING.
- **FR-011**: The system MUST determine the approver's identity and role from authenticated
  context and MUST NOT grant privileges based on a role supplied in the request body.
- **FR-012**: The system MUST return a clear error for rejected or unauthorized approval
  attempts.
- **FR-013**: A rejected approval attempt MUST NOT modify the invoice or its approval records.
- **FR-014**: After the required approvals are recorded, the system MUST set the invoice
  status to APPROVED.
- **FR-015**: This feature MUST NOT provide an action for an approver to reject an invoice;
  errors rejecting approval attempts MUST NOT change the invoice status to REJECTED.
- **FR-016**: The invoice approval history MUST show each approver's name, role, and the time
  of approval.

### Key Entities *(include if feature involves data)*

- **User**: An authenticated person who may approve invoices; has a unique identity and a
  Manager or Director role.
- **Invoice**: A payment request with an amount, a status, and zero or more approval records.
- **Approval**: A record connecting one user to one invoice, including the approver's name,
  role, and time of approval.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four specified boundary amounts (50,000; 50,001; 500,000; 500,001) produce
  the expected authorization and status outcomes in automated acceptance tests.
- **SC-002**: Every defined unauthorized, duplicate, out-of-order, and excess approval
  scenario is rejected with a clear error and leaves invoice data unchanged.
- **SC-003**: In all tested high-value workflows, the invoice remains PENDING after the first
  approval and becomes APPROVED only after a distinct Director records the second approval.
- **SC-004**: The complete approval workflow, including authentication and the high-value
  two-approver path, can be completed and verified in an end-to-end test.

## Assumptions

- An authenticated identity has one trusted role, either Manager or Director; role changes
  submitted by a requester do not affect that identity.
- Existing invoice statuses are PENDING, APPROVED, and REJECTED. Only PENDING invoices are
  eligible for approval.
- For invoices above 500,000, either a Manager or a Director may provide the first approval;
  the second approval must come from a different Director. This follows the assignment's
  literal wording and preserves the current behavior.

## Project Constraints

- The application uses Node.js, Express, and TypeScript with separation between controllers,
  services, repositories, models, and middleware.
- Unit and integration tests use Vitest; end-to-end tests use Playwright; mutation testing
  uses Stryker.
- Authentication middleware determines the user's identity and role; request-body roles are
  not trusted.
