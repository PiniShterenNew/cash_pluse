# CashPulse Core Features (MVP)

## 1. Receivables List
### Purpose
Provide an at-a-glance operational queue of open and overdue debts.

### Functional Definition
- List all debts not fully paid.
- Show key columns: client, amount, due date, overdue days, last reminder, status, expected payment date.
- Enable quick filters (overdue, due soon, high amount, no reminder sent).

### Key Behaviors
- Sorting by due date, amount, and risk score.
- Bulk selection for reminder sending.
- Real-time updates when payment status changes.

### Edge Cases
- Partially paid debts remain open with remaining balance.
- Missing due date appears under "No due date" and excluded from overdue calculation.
- Canceled debt hidden by default but available via filter.

## 2. Add Debt
### Purpose
Create a structured receivable record tied to a client and expected payment date.

### Required Inputs
- Client
- Amount
- Currency (default ILS)
- Due date
- Optional external invoice reference

### Flow
1. User opens add debt form.
2. Selects existing client or creates client inline.
3. Submits debt.
4. System validates data and creates debt record.
5. System requests payment link generation.

### Edge Cases
- Duplicate external invoice references trigger warning (not hard block unless company setting enforces uniqueness).
- Due date in past allowed but debt starts as overdue.

## 3. WhatsApp Reminder
### Purpose
Trigger timely customer follow-up via preferred communication channel.

### Functional Definition
- Send templated reminder messages containing payment context and link.
- Track reminder attempts and statuses.

### Reminder States
- Draft
- Queued
- Sent
- Delivered
- Read (if available)
- Failed

### Edge Cases
- Missing WhatsApp permission token blocks send and prompts re-auth.
- Invalid phone number marks reminder as failed with explicit error reason.

## 4. Payment Link
### Purpose
Reduce payment friction by embedding a direct, secure payment path.

### Functional Definition
- Generate unique link per debt via PayPlus.
- Link metadata includes debt_id and company_id for webhook reconciliation.

### Constraints
- Link expiration policy configurable (default: no expiration in MVP unless provider requires).
- Regeneration allowed if original link invalid/expired.

## 5. Payment Status Tracking
### Purpose
Keep debt status synchronized with payment provider events.

### Functional Definition
- Receive webhook events.
- Validate signature and idempotency.
- Map provider status to internal payment status.
- Update debt aggregate paid amount.

### Edge Cases
- Duplicate webhook events should be idempotent.
- Out-of-order events must not regress a finalized payment.

## 6. Expected Payment Date Prediction
### Purpose
Provide likely cash arrival date to improve planning and prioritization.

### Inputs
- Client payment history
- Historical lateness vs due dates
- Reminder response patterns
- Amount and seasonality heuristics

### Output
- Predicted date + confidence band.
- Reason codes (e.g., "usually pays 6 days late").

## 7. Client Reliability Score
### Purpose
Quantify payment behavior risk at the client level.

### Model Intent
- Score scale: 0-100.
- Higher score means higher likelihood of on-time payment.

### Behavioral Factors
- On-time payment ratio
- Average days late
- Reminder-to-payment conversion latency
- Frequency of partial payments

### UX Usage
- Display as badge in client profile and receivables list.
- Influence queue prioritization for reminders.
