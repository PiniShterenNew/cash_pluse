# CashPulse Sprint Plan (MVP)

## Sprint 1 - Auth + Database Foundation
### Objectives
- User authentication and company scoping.
- Initial database schema and migrations.

### Stories
- As a user, I can sign in and access only my company data.
- As a developer, I can run reproducible schema migrations.

### Exit Criteria
- Auth flow functional.
- RLS enabled for primary tables.

## Sprint 2 - Clients + Debts
### Objectives
- Implement client and debt CRUD.
- Build receivables list with filters.

### Stories
- As a user, I can add a client.
- As a user, I can create a debt and see it in receivables list.

### Exit Criteria
- Debt status derivation works.
- List supports overdue and due-soon filters.

## Sprint 3 - Payments
### Objectives
- Integrate PayPlus link generation.
- Process payment webhooks and reconcile statuses.

### Stories
- As a user, I can generate a payment link per debt.
- As a user, paid debts update automatically after payment.

### Exit Criteria
- Idempotent webhook processing.
- Debt amount_outstanding updates correctly.

## Sprint 4 - WhatsApp Integration
### Objectives
- Reminder template and sending flow.
- Reminder lifecycle status tracking.

### Stories
- As a user, I can send a WhatsApp reminder from a debt row.
- As a user, I can see send success/failure history.

### Exit Criteria
- Reminder records persisted.
- Delivery/failure events reflected in UI.

## Sprint 5 - AI Features
### Objectives
- Expected payment date prediction.
- Reliability score computation.
- AI reminder drafts.

### Stories
- As a user, I can view predicted payment date and confidence.
- As a user, I can use AI draft and edit before sending.

### Exit Criteria
- Prediction snapshots stored.
- AI outputs visible with explanations.

## Sprint 6 - Stabilization and Launch
### Objectives
- Reliability hardening and analytics instrumentation.

### Stories
- As an operator, I can monitor webhook failures and retries.
- As PM, I can measure funnel from debt creation to payment.

### Exit Criteria
- Runbooks documented.
- PostHog events implemented for core funnel.
