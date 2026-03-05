-- ─── Extensions ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ─────────────────────────────────────────────────────
create type debt_status as enum (
  'draft',
  'open',
  'due_today',
  'overdue',
  'partially_paid',
  'paid',
  'canceled',
  'disputed'
);

create type user_role as enum ('owner', 'member');

create type reminder_channel as enum ('whatsapp');

create type reminder_status as enum (
  'pending',
  'sent',
  'delivered',
  'read',
  'failed'
);

create type payment_status as enum (
  'pending',
  'completed',
  'failed',
  'refunded'
);

create type connection_status as enum ('not_connected', 'connected', 'error');

-- ─── Tables ─────────────────────────────────────────────────────

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text,
  default_currency text not null default 'ILS',
  timezone text not null default 'Asia/Jerusalem',
  whatsapp_config_status connection_status not null default 'not_connected',
  payplus_config_status connection_status not null default 'not_connected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null default 'owner',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, email)
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
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
  company_id uuid not null references companies(id) on delete cascade,
  client_id uuid not null references clients(id) on delete restrict,
  title text,
  description text,
  invoice_reference text,
  amount_total numeric(12,2) not null check (amount_total > 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  amount_outstanding numeric(12,2) not null,
  currency text not null default 'ILS',
  issue_date date,
  due_date date not null,
  status debt_status not null default 'draft',
  overdue_days int not null default 0,
  payment_link_url text,
  payment_link_provider_ref text,
  expected_payment_date date,
  expected_payment_confidence text,
  last_reminder_sent_at timestamptz,
  created_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  check (amount_paid <= amount_total)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  debt_id uuid not null references debts(id) on delete restrict,
  provider text not null default 'payplus',
  provider_transaction_id text,
  provider_event_id text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'ILS',
  status payment_status not null default 'pending',
  paid_at timestamptz,
  failure_reason text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_event_id)
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  debt_id uuid not null references debts(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  channel reminder_channel not null default 'whatsapp',
  template_key text not null,
  rendered_message text not null,
  status reminder_status not null default 'pending',
  provider_message_id text,
  sent_by_user_id uuid references users(id) on delete set null,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
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
  company_id uuid not null references companies(id) on delete cascade,
  subject_type text not null,
  subject_id uuid not null,
  model_version text not null,
  expected_payment_date date,
  reliability_score int check (reliability_score between 0 and 100),
  confidence_score numeric(5,4),
  explanation jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

-- ─── Indexes ────────────────────────────────────────────────────
create index idx_clients_company on clients(company_id);
create index idx_clients_archived on clients(company_id, archived_at) where archived_at is null;
create index idx_debts_company_status_due on debts(company_id, status, due_date);
create index idx_debts_client on debts(client_id);
create index idx_payments_debt on payments(debt_id);
create index idx_reminders_debt_sent on reminders(debt_id, sent_at desc);
create index idx_activity_logs_entity on activity_logs(company_id, entity_type, entity_id, created_at desc);
create index idx_prediction_subject on prediction_snapshots(company_id, subject_type, subject_id, generated_at desc);

-- ─── Updated_at Trigger ─────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_companies_updated_at
  before update on companies
  for each row execute function set_updated_at();

create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger trg_clients_updated_at
  before update on clients
  for each row execute function set_updated_at();

create trigger trg_debts_updated_at
  before update on debts
  for each row execute function set_updated_at();

create trigger trg_payments_updated_at
  before update on payments
  for each row execute function set_updated_at();

create trigger trg_reminders_updated_at
  before update on reminders
  for each row execute function set_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────
alter table companies enable row level security;
alter table users enable row level security;
alter table clients enable row level security;
alter table debts enable row level security;
alter table payments enable row level security;
alter table reminders enable row level security;
alter table activity_logs enable row level security;
alter table prediction_snapshots enable row level security;

-- Helper: extract company_id from JWT
create or replace function auth_company_id()
returns uuid as $$
  select (auth.jwt() ->> 'company_id')::uuid;
$$ language sql stable security definer;

-- companies: user can only see their own company
create policy "companies: own company only"
  on companies for all
  using (id = auth_company_id());

-- users: only same company
create policy "users: same company"
  on users for all
  using (company_id = auth_company_id());

-- clients: same company
create policy "clients: same company"
  on clients for all
  using (company_id = auth_company_id());

-- debts: same company
create policy "debts: same company"
  on debts for all
  using (company_id = auth_company_id());

-- payments: same company
create policy "payments: same company"
  on payments for all
  using (company_id = auth_company_id());

-- reminders: same company
create policy "reminders: same company"
  on reminders for all
  using (company_id = auth_company_id());

-- activity_logs: same company (read only for users)
create policy "activity_logs: same company read"
  on activity_logs for select
  using (company_id = auth_company_id());

-- prediction_snapshots: same company
create policy "prediction_snapshots: same company"
  on prediction_snapshots for all
  using (company_id = auth_company_id());
