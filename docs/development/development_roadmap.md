# CashPulse Development Roadmap

## 1. Roadmap Strategy
Roadmap is organized by delivery of a complete collections loop as early as possible, then intelligence and optimization.

## 2. Phase 0 - Foundation
### Goals
- Repository setup, CI, environment configuration.
- Supabase project setup and base schema.
- Authentication and tenant bootstrap.

### Deliverables
- Next.js scaffold and shared UI primitives.
- Supabase migration pipeline.
- Baseline observability (logs, errors).

## 3. Phase 1 - Core Data and CRUD
### Goals
- Client and debt data model implementation.
- Receivables list and add debt flow.

### Deliverables
- Client CRUD APIs and UI.
- Debt creation and status derivation.
- Core filters and sorting.

## 4. Phase 2 - Payment Infrastructure
### Goals
- Payment link generation and webhook ingestion.
- Debt/payment reconciliation.

### Deliverables
- PayPlus adapter service.
- Webhook endpoint with idempotency.
- Activity logs for payment events.

## 5. Phase 3 - Reminder Infrastructure
### Goals
- WhatsApp reminder send flow.
- Reminder lifecycle tracking.

### Deliverables
- Template framework.
- Send reminder action from list/detail.
- Delivery/failure state updates.

## 6. Phase 4 - Intelligence Layer
### Goals
- Expected payment prediction.
- Client reliability scoring.
- AI reminder drafting.

### Deliverables
- Prediction service + snapshot storage.
- Score visualization and explainability UI.
- AI fallback logic.

## 7. Phase 5 - Hardening and Launch Readiness
### Goals
- Security, performance, and operational reliability.

### Deliverables
- RLS policy audit.
- Retry/dead-letter workflows.
- Monitoring dashboards and runbooks.
- Beta feedback loop and polish.

## 8. Post-MVP Backlog Themes
- Reminder automation rules.
- Team permissions expansion.
- Advanced collections analytics.
- Additional payment providers.
