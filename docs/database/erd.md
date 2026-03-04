# CashPulse Entity Relationship Diagram (ERD)

## 1. ERD Overview
CashPulse data design is centered around company-level tenancy. Every operational entity is scoped to a company and connected to receivables workflows.

## 2. Textual ERD
```text
companies (1) ----< users
companies (1) ----< clients
companies (1) ----< debts
companies (1) ----< payments
companies (1) ----< reminders
companies (1) ----< activity_logs
companies (1) ----< prediction_snapshots

clients   (1) ----< debts
debts     (1) ----< payments
debts     (1) ----< reminders
clients   (1) ----< reminders  (redundant FK for query speed/audit)
```

## 3. Relationship Semantics

### 3.1 Company -> Client
- One company manages many clients.
- Client uniqueness can be optionally constrained by phone/email per company.

### 3.2 Client -> Debt
- A client can have many debt records across time.
- Debt lifecycle state is independent per record.

### 3.3 Debt -> Payment
- A debt can have zero or many payments.
- Supports partial payments and multi-event provider flows.

### 3.4 Debt -> Reminder
- A debt can have multiple reminder attempts.
- Reminder history is critical for performance analytics and AI inputs.

### 3.5 Entity -> ActivityLog
- Any significant mutation emits an activity event.
- Provides forensic timeline and user/system accountability.

### 3.6 Subject -> PredictionSnapshot
- Either debt or client can receive prediction records.
- Snapshot table supports model evolution and historical comparison.

## 4. Cardinality and Optionality Rules
- Debt must reference exactly one client and one company.
- Payment must reference exactly one debt and one company.
- Reminder must reference one debt, one client, and one company.
- User may be null in activity log for system/webhook actions.

## 5. Referential Integrity Risks and Mitigations
- **Risk:** orphan reminders if debt is hard-deleted.
  - **Mitigation:** prohibit hard delete where references exist.
- **Risk:** mismatched company_id across linked rows.
  - **Mitigation:** write-time validation and RLS.
- **Risk:** large activity log growth.
  - **Mitigation:** partitioning/archival strategy in later phases.
