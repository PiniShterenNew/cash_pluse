# CashPulse Deployment Guide

## 1. Environments
- **Local:** developer machine with Supabase local/remote dev project.
- **Staging:** pre-production integration testing.
- **Production:** live customer environment.

## 2. Infrastructure Components
- Vercel project for Next.js frontend.
- Supabase project for database/auth/realtime/functions.
- Secrets store for API keys (WhatsApp, PayPlus, OpenAI, PostHog).

## 3. Environment Variables
### Frontend
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`

### Backend/Server
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPLUS_API_KEY`
- `PAYPLUS_WEBHOOK_SECRET`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `OPENAI_API_KEY`

## 4. Deployment Steps
1. Merge code into main branch.
2. Run CI checks (lint, tests, typecheck).
3. Apply database migrations to target environment.
4. Deploy frontend to Vercel.
5. Deploy/update Supabase Edge Functions.
6. Validate health checks and smoke tests.

## 5. Migration Strategy
- All schema changes via versioned SQL migrations.
- Backward-compatible API changes preferred.
- Data backfills run as controlled scripts with logging.

## 6. Webhook Deployment Checklist
- Webhook endpoint reachable via HTTPS.
- Signature secret configured and validated.
- Idempotency constraints in place.
- Test payload replay executed before launch.

## 7. Monitoring and Alerting
- Error tracking for frontend and backend runtime.
- Alerts for webhook processing failure rate spikes.
- Alerts for WhatsApp send failure anomalies.
- DB performance monitoring for slow receivables queries.

## 8. Rollback Plan
- Frontend rollback through Vercel previous deployment.
- DB rollback via migration down script where safe; otherwise forward-fix migration.
- Disable problematic integration via feature flag if external outage occurs.

## 9. Security Operations
- Rotate API secrets on schedule.
- Restrict service role key access.
- Audit logs reviewed for anomalous webhook/auth behavior.

## 10. Launch Readiness Checklist
- End-to-end debt -> reminder -> payment -> webhook flow validated.
- RLS policy audit passed.
- Critical dashboards operational.
- Support team runbook prepared.
