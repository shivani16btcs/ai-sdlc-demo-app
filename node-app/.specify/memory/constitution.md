<!--
Sync Impact Report
Version change: unversioned template → 1.0.0 (initial ratification)
Modified principles: none; five initial principles established
Added sections: Technical and Domain Constraints; Development Workflow and Quality Gates
Removed sections: none
Follow-up TODOs: confirm the original ratification date
-->
# Invoice Approval Node App Constitution

## Core Principles

### I. Layered Domain Boundaries
Invoice lifecycle and approval policy MUST live in services, not controllers. Controllers
MUST handle HTTP concerns and delegate business decisions; repositories MUST own persistence
access; models MUST define the shared domain contracts. This separation keeps approval rules
consistent across API entry points and testable without HTTP or storage dependencies.

### II. Typed and Validated Boundaries
Application code MUST use the project's strict TypeScript configuration and explicit domain
types. Data from HTTP requests MUST be validated before it is used to create or change domain
state. Invalid input MUST produce an explicit client error and MUST NOT mutate stored data.

### III. Tested Business Behavior
Every new or changed approval rule MUST have automated tests covering its allowed and rejected
paths, including boundary values and state changes where applicable. API behavior MUST be
covered by tests at the HTTP boundary; user-facing invoice workflow changes MUST also be
covered by end-to-end tests.

### IV. Approval Integrity and Access Control
Approval actions MUST authenticate the caller and enforce the applicable role, amount, and
approval-count requirements in the service layer. The same user MUST NOT approve an invoice
more than once. Rejected actions MUST leave invoice state unchanged. Demo credentials and
tokens MUST remain demo-only and MUST NOT be presented or reused as production secrets.

### V. Small, Verifiable Changes
Changes MUST follow existing project patterns and use the smallest dependency or abstraction
that meets the requirement. Each change MUST pass the relevant build and automated tests before
it is considered complete. New dependencies MUST have a clear need that existing project
capabilities cannot meet.

## Technical and Domain Constraints

The application is a Node.js and TypeScript invoice-approval demo using Express. Invoice
approval decisions MUST honor the amount thresholds and distinct-approver requirements
implemented by the domain service. The current repository is in-memory; features MUST NOT
imply durable persistence unless a persistence mechanism is explicitly introduced and tested.
Demo authentication is for local demonstration only and is not a production identity system.

## Development Workflow and Quality Gates

Developers MUST run `npm run build` and `npm test` in `node-app` for application code changes.
Changes affecting a user-facing invoice workflow MUST also run `npm run test:e2e`. Tests MUST
assert externally observable behavior and, for rejected approval attempts, verify that invoice
state remains unchanged. Reviewers MUST check that business rules remain in services, inputs
are validated at application boundaries, and no real credentials or customer data are added.

## Governance

This constitution governs changes to the Node app. Amendments MUST be made in a reviewed change
to this file, state their rationale, and assess their effect on existing principles and
development guidance. The constitution takes precedence over conflicting Node app guidance;
where implementation constraints prevent compliance, the exception and its rationale MUST be
documented in the change for review.

Constitution versions use semantic versioning: MAJOR for backward-incompatible removal or
redefinition of a principle, MINOR for a new principle or materially expanded guidance, and
PATCH for clarifications that do not change governance. Authors and reviewers MUST check
changes against these principles and the applicable build and test gates before merge.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-11-12
