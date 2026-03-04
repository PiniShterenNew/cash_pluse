# CashPulse MVP Scope

## 1. Scope Philosophy
The MVP must deliver end-to-end value for collections while avoiding platform sprawl. A complete collection loop is mandatory: create debt -> remind client -> receive payment -> update status.

## 2. In-Scope Capabilities
1. Company onboarding and authentication.
2. Client management (create/read/update/archive).
3. Debt management (create/read/update status).
4. Payment link generation via PayPlus.
5. WhatsApp reminder sending.
6. Webhook processing for payment confirmation.
7. Receivables dashboard/list with filters.
8. Basic AI outputs:
   - expected payment date
   - client reliability score

## 3. Explicit Out-of-Scope
- General ledger accounting.
- Expense and vendor management.
- Bank account sync.
- Native iOS/Android apps.
- Complex role-based permissions.
- Multi-entity consolidation.
- Advanced BI and custom analytics builder.

## 4. MVP Exit Criteria
MVP is considered complete when:
- A user can create a debt and send a reminder with payment link in <60 seconds.
- Payment webhook reliably updates debt status with idempotent handling.
- Users can identify all overdue debts without manual filtering complexity.
- AI fields are generated and visible for debts/clients with sufficient history.

## 5. Quality Thresholds
- Functional correctness of status transitions.
- Secure webhook validation.
- Audit logs for major state changes.
- Responsive UI for desktop and mobile web.

## 6. Operational Constraints
- Single-region initial deployment.
- Manual support for exceptional payment disputes.
- No hard dependency on external accounting APIs in MVP.
