---
name: invoice-business-rules
description: "Apply and review the approved Node.js Invoice Approval business rules, including Manager and Director limits, high-value approvals, status transitions, duplicate prevention, and boundary tests."
---

# Invoice Approval Business Rules

Use this skill when implementing, testing, or reviewing invoice approval policy.

## Source of truth

Before making a business decision, read `node-app/.specify/memory/constitution.md` and the
active feature specification identified by `node-app/.specify/feature.json`. The approved
feature specification is the source of truth for behavior. If this skill and the active
specification differ, follow the specification and flag this skill for update. Do not silently
change or infer business policy when requirements conflict; ask for clarification.

## Approval rules

- An invoice may be approved only while its status is `PENDING`.
- A Manager may approve an invoice with an amount up to and including 50,000.
- A Director may approve invoices through 500,000, including the 50,001–500,000 range.
- An invoice above 500,000 requires two distinct approvers.
- For an invoice above 500,000, either a Manager or a Director may approve first. The invoice
  stays `PENDING` after that first approval.
- The second approval must come from a different user whose authenticated role is Director.
  Once recorded, the invoice becomes `APPROVED`.
- A user may not approve the same invoice twice. Do not trust a role or identity supplied in
  the request body; use authenticated context.
- Rejected attempts, including attempts against already `APPROVED` invoices, must return a
  clear error and leave invoice data and approval history unchanged.
- This feature has no explicit invoice rejection action. Do not transition an invoice to
  `REJECTED` as a side effect of a denied approval.
- Each successful approval records and exposes the approver's ID, name, role, and timestamp.

## Boundary and negative scenarios

Ensure tests cover at least:

1. Manager approves 50,000; Manager is rejected at 50,001.
2. Director approves 50,001 and 500,000.
3. Either role can give the first approval at 500,001; status remains `PENDING`.
4. A different Director gives the second approval above 500,000; status becomes `APPROVED`.
5. A Manager is rejected as the second approver.
6. The same user is rejected when attempting a duplicate approval.
7. A third approval is rejected after two approvals.
8. Missing/invalid authentication, a non-`PENDING` invoice, and an already `APPROVED`
   invoice are rejected.
9. Every rejected attempt leaves the stored invoice and approval history unchanged.
