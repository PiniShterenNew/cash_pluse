# CashPulse Services Architecture

## 1. Service Boundaries
CashPulse uses a modular service architecture built around business workflows rather than technical layers.

Primary logical services:
1. Auth and Tenant Service
2. Client Service
3. Debt Service
4. Reminder Service
5. Payment Service
6. Prediction Service
7. Activity Logging Service

## 2. Auth and Tenant Service
### Responsibilities
- User authentication and session validation.
- Company scoping for all requests.
- Access control by role.

### Inputs/Outputs
- Input: login credentials / JWT tokens.
- Output: authenticated principal with company context.

## 3. Client Service
### Responsibilities
- CRUD lifecycle for clients.
- Store communication data and reliability score snapshot.
- Aggregate client-level debt metrics.

### Interfaces
- `POST /clients`
- `GET /clients`
- `GET /clients/:id`
- `PATCH /clients/:id`

## 4. Debt Service
### Responsibilities
- Create/update debt records.
- Derive and maintain debt status.
- Manage payment link references.

### Interfaces
- `POST /debts`
- `GET /debts`
- `GET /debts/:id`
- `PATCH /debts/:id`

### Internal Rules
- Debt status recalculation on due date boundary and payment updates.
- Consistency checks on amount fields.

## 5. Reminder Service
### Responsibilities
- Build reminder payload from templates and debt/client data.
- Send messages via WhatsApp API adapter.
- Track message lifecycle transitions.

### Interfaces
- `POST /debts/:id/reminders`
- `GET /debts/:id/reminders`

### Reliability Features
- Retry transient send failures.
- Persist failure reasons for operator troubleshooting.

## 6. Payment Service
### Responsibilities
- Generate payment links using PayPlus API.
- Process provider webhooks.
- Reconcile payments to debts.

### Interfaces
- `POST /debts/:id/payment-link`
- `POST /webhooks/payplus`

### Event Handling Guarantees
- Signature verification required.
- Idempotent processing by provider event id.
- Atomic transaction for payment + debt status update.

## 7. Prediction Service
### Responsibilities
- Calculate expected payment dates.
- Calculate client reliability scores.
- Generate AI explanation artifacts.

### Interfaces
- `POST /internal/predictions/recompute`
- `GET /debts/:id/prediction`
- `GET /clients/:id/reliability`

## 8. Activity Logging Service
### Responsibilities
- Persist immutable operational events.
- Support timeline rendering in UI.
- Support support/audit investigations.

### Event Coverage
- debt_created
- reminder_sent
- reminder_failed
- payment_succeeded
- payment_failed
- status_overridden

## 9. Cross-Service Interaction Patterns
- Synchronous calls for user-initiated actions requiring immediate UI response.
- Asynchronous jobs for heavy or retry-prone operations (AI generation, webhook retries).
- Event emission to realtime channels after committed state changes.

## 10. Failure Domains
- Reminder failures should not block debt creation.
- AI prediction failures should not block reminder sending.
- Payment webhook failures must trigger retry pipeline and alerting.
