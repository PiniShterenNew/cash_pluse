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
- EVERY table needs at least: SELECT policy for owner, INSERT policy for authenticated
- Pattern: `auth.uid() = user_id` for single-tenant
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

## Database Schema (core tables)
- profiles (id, user_id FK auth.users, business_name, business_type, sector)
- invoices (id, user_id, client_id, number, amount, issued_date, due_date, status, payment_terms)
- clients (id, user_id, name, contact_name, phone, email, reliability_score)
- transactions (id, user_id, type enum, description, amount, date, category, is_recurring)
- whatsapp_messages (id, user_id, invoice_id, client_id, template, sent_at, status)
- settings (id, user_id, threshold, alert_preferences jsonb, whatsapp_config jsonb)

## Indexes
- invoices: (user_id, status), (user_id, due_date), (client_id)
- transactions: (user_id, date), (user_id, type)
- clients: (user_id)
