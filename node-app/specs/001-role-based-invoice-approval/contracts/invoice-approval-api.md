# Invoice Approval API Contract

Base path: `/api`. JSON request and response bodies use `Content-Type: application/json`.

## Authentication

### `POST /auth/login`

Authenticates a demo user and returns an identity, role, and bearer token.

Request:

```json
{
  "username": "manager",
  "password": "<demo password>"
}
```

Successful response (`200`):

```json
{
  "user": {
    "id": "manager-1",
    "name": "Manager One",
    "role": "MANAGER"
  },
  "token": "<bearer token>"
}
```

Invalid credentials return `401` with `{ "message": "Invalid username or password." }`.
Demo authentication is not a production identity system.

## Invoices

### `POST /invoices`

Creates a PENDING invoice with no approvals.

Request:

```json
{
  "amount": 50001
}
```

`amount` must be a positive finite number. Invalid input returns `400` with a clear message.
Successful creation returns `201` and an invoice representation.

### `GET /invoices`

Returns the current invoice collection.

### `GET /invoices/{invoiceId}`

Returns the matching invoice (`200`) or `404` if it does not exist.

## Approvals

### `POST /invoices/{invoiceId}/approve`

Requires `Authorization: Bearer <token>`. The authenticated identity and role determine the
approval; request-body role or identity fields do not grant authority. The request has no
required body.

Successful response (`200`) contains the updated invoice. Each approval entry includes
`approverId`, `approverName`, `approverRole`, and `approvedAt` (an ISO-8601 JSON timestamp).

Possible errors:

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid authentication token. |
| `404` | Invoice does not exist. |
| `400` | Invoice is not PENDING, role is not permitted, user already approved, a required second Director approval is missing, or the invoice already has the required approvals. |

Every rejected attempt leaves invoice status and approval history unchanged. Attempts on an
already APPROVED invoice return a clear error. This API has no invoice-rejection operation.

## Workflow contract

| Amount | First/only approval | Expected result |
|--------|--------------------|-----------------|
| `0 < amount ≤ 50,000` | Manager or Director | APPROVED |
| `50,000 < amount ≤ 500,000` | Director | APPROVED |
| `amount > 500,000` | Manager or Director | Remains PENDING with one approval |
| `amount > 500,000`, after first approval | Different Director | APPROVED with two approvals |

