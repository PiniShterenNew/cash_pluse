# CashPulse Webhooks Specification

## 1. Purpose
Webhooks synchronize external payment status into CashPulse without manual reconciliation.

## 2. Endpoint
`POST /api/v1/webhooks/payplus`

- Public endpoint (no user JWT)
- Protected by signature and timestamp verification

## 3. Security Validation
1. Validate HMAC signature using shared secret.
2. Validate request timestamp against replay window (e.g., 5 minutes).
3. Validate provider account mapping to company context.
4. Enforce content-type and payload schema.

Reject invalid requests with non-2xx and log security event.

## 4. Expected Payload (Example)
```json
{
  "eventId": "evt_18f4df9f",
  "eventType": "payment.succeeded",
  "createdAt": "2026-04-15T08:12:41Z",
  "accountId": "pp_account_123",
  "transaction": {
    "transactionId": "txn_78342",
    "externalReference": "debt:8e8fd5c7-6db5-44c7-b8d7-e6342f0fe823",
    "amount": 4500.00,
    "currency": "ILS",
    "status": "succeeded",
    "paidAt": "2026-04-15T08:12:39Z"
  }
}
```

## 5. Processing Flow
1. Parse and validate payload.
2. Idempotency check by `eventId`.
3. Resolve company and debt from reference mapping.
4. Upsert payment record.
5. Recompute debt aggregates and status.
6. Insert activity log.
7. Publish realtime update.
8. Return `200 {"received": true}`.

## 6. Event Mapping
| Provider Event | Internal Payment Status | Debt Impact |
|---|---|---|
| payment.initiated | initiated | none |
| payment.pending | pending | none |
| payment.succeeded | succeeded | increment paid amount |
| payment.failed | failed | none |
| payment.refunded | refunded | decrement paid amount / reopen logic |

## 7. Idempotency Rules
- Store every processed `eventId` in payment table unique constraint.
- Duplicate events return 200 without additional writes.

## 8. Error Handling Strategy
- Temporary DB failure: return 500 to trigger provider retry.
- Unknown debt reference: return 202 and enqueue reconciliation task.
- Signature failure: return 401 and record security log.

## 9. Observability
Log fields:
- request_id
- event_id
- event_type
- company_id (if resolved)
- processing_ms
- outcome
- error_code (if failed)
