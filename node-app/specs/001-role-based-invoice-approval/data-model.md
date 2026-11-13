# Data Model: Role-Based Invoice Approval Workflow

## User

Represents an authenticated approver.

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | string | Stable identity; used to enforce distinct approvals. |
| `name` | string | Authenticated display name; copied into the approval history when approval is recorded. |
| `role` | `MANAGER \| DIRECTOR` | Resolved by authentication middleware; never trusted from an approval request body. |

## Invoice

Represents an invoice subject to approval.

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | string | Unique invoice identifier. |
| `amount` | number | Positive finite amount, validated when the invoice is created. |
| `status` | `PENDING \| APPROVED \| REJECTED` | Approval is allowed only from PENDING. This feature does not add a transition to REJECTED. |
| `approvals` | Approval[] | Ordered approval history; successful approvals only. |

## Approval

Represents one successful approval of an invoice.

| Field | Type | Constraints |
|-------|------|-------------|
| `approverId` | string | Authenticated user's stable identity; unique within an invoice's approval history. |
| `approverName` | string | Name from the authenticated user at the time approval is recorded. |
| `approverRole` | `MANAGER \| DIRECTOR` | Role from the authenticated user at the time of approval. |
| `approvedAt` | Date | Timestamp assigned when the service records the approval. Serialized as an ISO timestamp in JSON. |

## Relationships and invariants

- An invoice has zero or more approval records.
- Each approval belongs to one invoice and identifies one user.
- No user may appear more than once in an invoice's approval history.
- For amounts up to and including 50,000, a Manager or Director can approve once.
- For amounts above 50,000 and up to and including 500,000, only a Director can approve once.
- For amounts above 500,000, either role may approve first. The invoice remains PENDING
  after that approval. A distinct Director must approve second; then the invoice becomes
  APPROVED.
- An approval attempt against a non-PENDING invoice, an unauthorized role, a repeated
  approver, or an invoice already holding the required approvals is rejected without
  changing the invoice.
- Approval history is append-only through the approval workflow; this feature has no invoice
  rejection action.

## State transitions

| Current state | Condition | Result |
|---------------|-----------|--------|
| PENDING | Amount ≤ 50,000; Manager or Director approves | APPROVED; append one approval |
| PENDING | 50,000 < amount ≤ 500,000; Director approves | APPROVED; append one approval |
| PENDING | Amount > 500,000; first distinct Manager or Director approves | PENDING; append one approval |
| PENDING | Amount > 500,000; a different Director approves second | APPROVED; append second approval |
| PENDING | Approval is unauthorized or invalid | No state or history change |
| APPROVED or REJECTED | Any approval attempt | No state or history change |
