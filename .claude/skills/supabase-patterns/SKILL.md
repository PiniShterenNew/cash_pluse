---
name: supabase-patterns
description: |
  Supabase patterns and best practices for CashPulse. Use when writing database queries,
  creating migrations, setting up RLS policies, configuring auth, using Realtime subscriptions,
  creating Edge Functions, or any Supabase-related code. Also triggers on: PostgreSQL, SQL,
  migrations, row level security, auth, storage buckets.
---

# Supabase Patterns for CashPulse

## Client Setup
- Server client: `src/lib/supabase/server.ts` (for Server Components, Server Actions)
- Browser client: `src/lib/supabase/client.ts` (for Client Components)
- Middleware client: `src/lib/supabase/middleware.ts`
- Always use `@supabase/ssr` package for Next.js integration

## Type Safety
- Generate types: `npx supabase gen types typescript --local > src/lib/database.types.ts`
- Re-generate after EVERY migration
- All queries must use generated types
- Create domain types in feature folders that extend DB types

## RLS (Row Level Security)
- EVERY table must have RLS enabled
- EVERY table needs at least: SELECT policy for company, INSERT policy for authenticated company members
- Pattern for domain tables: `company_id = (auth.jwt() ->> 'company_id')::uuid`
- Pattern for users table: `id = auth.uid()` OR `company_id = (auth.jwt() ->> 'company_id')::uuid`
- Webhook/Edge Functions use service_role key — enforce company_id scoping in code
- Test RLS with: `supabase test db` before deploying

## Migrations
- Create via: `npx supabase migration new [name]`
- File in: `supabase/migrations/[timestamp]_[name].sql`
- Always include: CREATE TABLE, RLS enable, RLS policies, indexes
- Never edit existing migrations — create new ones

## Auth
- Use Supabase Auth with email/password + Google OAuth
- `onAuthStateChange` in root layout
- Protected routes via middleware checking session
- User profile table linked to auth.users via trigger

## Realtime
- Subscribe to invoice status changes for live Kanban updates
- Subscribe to cash balance changes for dashboard refresh
- Use Supabase channels, not raw WebSocket
- Unsubscribe on component unmount

## Multi-Tenant Model
- Tenant unit = **company** (a business). One company can have multiple users.
- RLS policy pattern: `company_id = (auth.jwt() ->> 'company_id')::uuid`
- NEVER use `auth.uid() = user_id` for domain tables — use `company_id` scope.
- Exception: `companies` and `users` tables themselves use `auth.uid()` checks.

## Database Schema (canonical tables)
- companies (id, name, registration_number, default_currency, timezone, whatsapp_config_status, payplus_config_status)
- users (id FK auth.users, company_id FK companies, email, full_name, role enum owner/member)
- clients (id, company_id, name, contact_name, phone_e164, email, reliability_score, total_debt_open, total_debt_paid, archived_at)
- debts (id, company_id, client_id, title, invoice_reference, amount_total, amount_paid, amount_outstanding, currency, due_date, status, payment_link_url, expected_payment_date, last_reminder_sent_at)
- payments (id, company_id, debt_id, provider 'payplus', provider_transaction_id, amount, status, raw_payload jsonb)
- reminders (id, company_id, debt_id, client_id, channel 'whatsapp', template_key, rendered_message, status, sent_at, delivered_at, read_at)
- activity_logs (id, company_id, actor_type, entity_type, entity_id, action, metadata jsonb)
- prediction_snapshots (id, company_id, subject_type, subject_id, model_version, expected_payment_date, reliability_score, confidence_score)

## DebtStatus Enum (canonical)
`draft | open | due_today | overdue | partially_paid | paid | canceled | disputed`

## Indexes
- debts: (company_id, status, due_date), (client_id)
- payments: (debt_id)
- reminders: (debt_id, sent_at DESC)
- clients: (company_id)
- activity_logs: (company_id, entity_type, entity_id, created_at DESC)
