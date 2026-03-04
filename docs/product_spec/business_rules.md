# CashPulse Business Rules

## 1. Debt Lifecycle Rules

### 1.1 Debt Creation
1. Debt must belong to an existing active client in same company.
2. Debt amount must be greater than zero.
3. Due date is required in MVP.
4. On creation:
   - amount_paid = 0
   - amount_outstanding = amount_total
   - status derived from due_date relative to current date.

### 1.2 Overdue Determination
A debt is **overdue** when:
- status not in {paid, canceled, disputed}
- amount_outstanding > 0
- due_date < current_date in company timezone.

`overdue_days = max(0, current_date - due_date)`

### 1.3 Partial and Full Payment
- If successful payment amount < amount_outstanding, status becomes partially_paid.
- If cumulative successful payment amount equals amount_total, status becomes paid and closed_at set.
- Payment amount beyond outstanding is rejected unless manual adjustment mode is enabled (post-MVP).

### 1.4 Reopen Rule
- Paid debt may be reopened only by refund/dispute event or privileged manual override with reason logged.

## 2. Reminder Rules

### 2.1 Eligibility
A reminder can be sent only if:
- debt.status in {open, due_today, overdue, partially_paid}
- client has valid phone_e164
- WhatsApp integration status is connected

### 2.2 Reminder Status Changes
- draft -> queued: user confirms send action.
- queued -> sent: provider API accepts request.
- sent -> delivered/read: provider callback or polling update.
- sent/queued -> failed: provider rejection, timeout, or invalid destination.

### 2.3 Reminder Cadence Constraints
- Soft limit: no more than 1 reminder per debt per 24 hours by default.
- Hard block optional company setting for anti-spam policy.
- Escalation template can be used after N failed attempts (default N=2).

## 3. Payment Webhook Rules

### 3.1 Authenticity Validation
Every webhook event must pass:
- Signature verification.
- Event timestamp freshness window.
- Provider account mapping check.

Events failing validation are rejected with 401/400 and logged.

### 3.2 Idempotency
- Unique key: provider_event_id.
- If already processed, endpoint returns 200 idempotent acknowledgement without applying state changes.

### 3.3 Ordering and Finality
- System applies monotonic status progression.
- Terminal success cannot be downgraded by stale pending events.
- Refund/dispute events create separate adjustments and do not silently erase payment history.

## 4. Prediction Rules

### 4.1 Expected Payment Date
- Generated only when minimum signal exists (e.g., at least one client historical payment or fallback company baseline).
- Output date must be >= today for unpaid debts.
- Confidence bucket: low/medium/high based on feature completeness.

### 4.2 Reliability Score
- Range 0-100.
- Recalculated on payment success/failure and schedule deviations.
- New clients with insufficient data receive baseline score (e.g., 50) flagged as low confidence.

## 5. Data Integrity Rules
- company_id is mandatory on all domain entities.
- Cross-company references are forbidden.
- Delete operations are soft-delete for clients and debts where historical records exist.
- ActivityLog entries are immutable.

## 6. Access Rules (MVP)
- Authenticated user can access only their company data.
- Owner role can configure integrations and company settings.
- Member role can create debts and send reminders but cannot delete company.

## 7. Notification Rules
- Optional in-app alerts for:
  - debt becoming overdue
  - payment received
  - reminder failure
- Notifications are informational and must not block core workflow.
