# CashPulse System Architecture

## 1. Architecture Goals
- High developer velocity with managed infrastructure.
- Strong tenant isolation and secure financial event handling.
- Fast UI response and real-time status updates.
- Reliable third-party integration boundaries.

## 2. High-Level Architecture
```text
[Next.js Frontend]
    |
    | HTTPS (Auth + API)
    v
[Supabase Platform]
  - Postgres (primary data)
  - Auth (user identity)
  - Realtime (subscriptions)
  - Edge Functions (integration/webhook processors)
    |
    +--> [WhatsApp Cloud API]
    +--> [PayPlus Payments]
    +--> [OpenAI API]

[PostHog] <- client and server events
[Vercel]  <- hosting for web app
```

## 3. Frontend Architecture
- Next.js App Router with route-level data fetching.
- TypeScript strict mode.
- TailwindCSS for UI system.
- Zustand stores for local interaction state (filters, selections, modal states).

### 3.1 Rendering Strategy
- Server Components for data-heavy list pages.
- Client Components for interactive actions (bulk reminders, inline edits).
- Optimistic UI updates for non-critical actions, followed by server confirmation.

### 3.2 Frontend Modules
- Auth module
- Receivables module
- Client module
- Reminder composer module
- Analytics module (MVP-lite)

## 4. Backend Architecture
Supabase provides core backend primitives.

### 4.1 Data Layer
- PostgreSQL schema with RLS.
- Materialized or derived fields for list performance (e.g., overdue_days).
- Trigger/functions for status recalculation.

### 4.2 Service Layer
- RPCs and Edge Functions for complex workflows:
  - create_debt_with_payment_link
  - send_whatsapp_reminder
  - process_payplus_webhook
  - recompute_predictions

### 4.3 Event and Realtime Layer
- Realtime subscriptions for debt/payment table changes.
- UI updates list row statuses without full refresh.

## 5. Integration Architecture

### 5.1 WhatsApp Integration
- Outbound reminders through WhatsApp Cloud API.
- Delivery/read updates persisted to reminder records.
- Retries with exponential backoff for transient failures.

### 5.2 PayPlus Integration
- Payment link creation from debt context.
- Webhook endpoint receives payment events.
- Signature validation and idempotent event processing.

### 5.3 OpenAI Integration
- Called from backend service (never direct from browser).
- Generates reminder draft variants and prediction explanations.
- Stores generated metadata with model versioning.

## 6. Webhook Handling Architecture
1. Incoming webhook hits dedicated Edge Function endpoint.
2. Verify signature and event freshness.
3. Check idempotency store/table.
4. Persist raw event (for audit).
5. Map to internal Payment status.
6. Recompute Debt aggregates and status.
7. Emit realtime notification + activity log.
8. Return success acknowledgement.

## 7. Security Architecture
- Supabase Auth for user sessions.
- RLS per company_id on all domain tables.
- Secrets in environment variables (Vercel + Supabase).
- Rate limiting on integration endpoints where possible.
- Audit logs for critical state transitions.

## 8. Reliability and Failure Handling
- Retry queues for outbound WhatsApp sends.
- Dead-letter table for failed webhook events after max retry.
- Scheduled reconciliation job for unmatched payment events.
- Observability dashboards for webhook latency and error rates.

## 9. Scalability Considerations
- Pagination and index strategy for debt list.
- Async processing for heavy integration tasks.
- Batching realtime updates to reduce UI thrash at scale.

## 10. Architecture Decisions and Tradeoffs
- Managed backend (Supabase) accelerates MVP at cost of deeper vendor coupling.
- Strong scope boundary minimizes integration complexity.
- Event-driven updates increase consistency but require robust idempotency discipline.
