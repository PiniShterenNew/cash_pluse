# CashPulse Database Schema

## 1. Schema Design Principles
- Multi-tenant isolation using `company_id`.
- Immutable event logs for traceability.
- Strong relational integrity for financial records.
- Derived fields for query performance where justified.

## 2. PostgreSQL DDL (Reference)
```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text,
  default_currency text not null default 'ILS',
  timezone text not null default 'Asia/Jerusalem',
  whatsapp_config_status text not null default 'not_connected',
  payplus_config_status text not null default 'not_connected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key,
  company_id uuid not null references companies(id),
  email text not null,
  full_name text not null,
  role text not null check (role in ('owner','member')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, email)
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  name text not null,
  contact_name text,
  phone_e164 text not null,
  email text,
  external_reference text,
  reliability_score int check (reliability_score between 0 and 100),
  total_debt_open numeric(12,2) not null default 0,
  total_debt_paid numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table debts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  client_id uuid not null references clients(id),
  title text,
  description text,
  invoice_reference text,
  amount_total numeric(12,2) not null check (amount_total > 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  amount_outstanding numeric(12,2) not null,
  currency text not null default 'ILS',
  issue_date date,
  due_date date not null,
  status text not null,
  overdue_days int not null default 0,
  payment_link_url text,
  payment_link_provider_ref text,
  expected_payment_date date,
  expected_payment_confidence text,
  last_reminder_sent_at timestamptz,
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  check (amount_paid <= amount_total)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  debt_id uuid not null references debts(id),
  provider text not null default 'payplus',
  provider_transaction_id text,
  provider_event_id text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'ILS',
  status text not null,
  paid_at timestamptz,
  failure_reason text,
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_event_id)
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  debt_id uuid not null references debts(id),
  client_id uuid not null references clients(id),
  channel text not null check (channel = 'whatsapp'),
  template_key text not null,
  rendered_message text not null,
  status text not null,
  provider_message_id text,
  sent_by_user_id uuid references users(id),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  actor_type text not null,
  actor_id uuid,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table prediction_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  subject_type text not null,
  subject_id uuid not null,
  model_version text not null,
  expected_payment_date date,
  reliability_score int check (reliability_score between 0 and 100),
  confidence_score numeric(5,4),
  explanation jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);
```

## 3. Index Strategy
```sql
create index idx_clients_company on clients(company_id);
create index idx_debts_company_status_due on debts(company_id, status, due_date);
create index idx_debts_client on debts(client_id);
create index idx_payments_debt on payments(debt_id);
create index idx_reminders_debt_sent on reminders(debt_id, sent_at desc);
create index idx_activity_logs_entity on activity_logs(company_id, entity_type, entity_id, created_at desc);
create index idx_prediction_subject on prediction_snapshots(company_id, subject_type, subject_id, generated_at desc);
```

## 4. Constraints and Integrity Notes
- All business tables require company_id.
- Cross-company joins must be denied by RLS and application guards.
- `amount_outstanding` should be maintained transactionally with payment writes.
- Soft delete uses `archived_at` for clients; historical debts remain intact.

## 5. Row-Level Security (Conceptual)
- Policy template: `company_id = auth.jwt()->>'company_id'`.
- Webhook functions operate with service role and enforce company scoping in code.
