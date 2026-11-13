# Research: Role-Based Invoice Approval Workflow

## Decision: Reuse the current application layers and in-memory storage

**Rationale**: The application already has an Express invoice router, an `ApprovalService`,
an `InvoiceRepository`, typed invoice/user models, and authentication middleware. Keeping
the feature within these seams meets the constitution's layered-boundary rule without adding
infrastructure.

**Alternatives considered**: Introducing a database or extracting a new domain package was
not justified for the in-memory demo or this feature's scope.

## Decision: Treat the authenticated middleware user as the approval authority

**Rationale**: The approval route already runs `authenticate` and passes its resolved `User`
to the service. Approval decisions must continue to use that user and must not accept a role
from request data.

**Alternatives considered**: Accepting approver identity or role in the approval body would
allow a requester to claim privileges and is explicitly prohibited by the specification.

## Decision: Apply the specified amount and two-approver thresholds in the service

**Rationale**: Preserve the confirmed rules: Managers can approve amounts through 50,000;
Directors can approve amounts above 50,000 through 500,000; amounts above 500,000 need two
distinct approvers, with either role allowed first and a Director required second. The first
approval leaves the invoice PENDING; the second completes approval.

**Alternatives considered**: Restricting the first high-value approver to Directors conflicts
with the clarified assignment wording. Allowing a Manager to approve 50,001–500,000 conflicts
with the Manager limit.

## Decision: Include approver name in the approval record

**Rationale**: The clarified specification requires approval history to display the
approver's name, role, and time. The current record has an approver ID and role but no name.
Record the authenticated user's name when approval is accepted and expose it in the invoice
response.

**Alternatives considered**: Resolving names dynamically from the user store would add a
dependency that the current demo does not have and could make historical names change.

## Decision: Keep already-approved attempts and invalid approvals as non-mutating errors

**Rationale**: Only PENDING invoices may be approved. A non-pending invoice, including an
already APPROVED one, receives a clear error without changing status or approval history.
An explicit invoice rejection action is not part of this feature.

**Alternatives considered**: Treating repeated approval of an already-approved invoice as a
successful no-op would hide an invalid action and conflicts with the clarification.

## Decision: Use the existing test and mutation tools

**Rationale**: Vitest, Supertest, Playwright, and Stryker are already declared and configured
in `package.json` and their project configuration files. Tests can validate service behavior,
HTTP authentication, and the browser workflow without introducing tools.

**Alternatives considered**: A new test framework or test-only dependency is unnecessary.

## Remaining unknowns

- The Node runtime version is not pinned by a version file or `engines` declaration. This
  feature does not require selecting one; validation uses the installed project environment.
- No performance, availability, or data-retention targets are defined. The feature retains
  the current local demo and in-memory storage scope.
