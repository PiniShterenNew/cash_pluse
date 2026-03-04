# CashPulse — Database Schema

## Tables

### profiles
- id: uuid PK (= auth.users.id)
- business_name: text NOT NULL
- business_type: enum (osek_patur, osek_murshe, company, partnership)
- sector: enum (services, commerce, manufacturing, tech, construction, other)
- logo_url: text
- currency: text DEFAULT '₪'
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()

### clients
- id: uuid PK DEFAULT gen_random_uuid()
- user_id: uuid FK profiles(id) NOT NULL
- name: text NOT NULL
- contact_name: text
- phone: text
- email: text
- reliability_score: int DEFAULT 50 CHECK (0-100)
- avg_payment_days: int
- total_historical: numeric DEFAULT 0
- notes: text
- created_at/updated_at: timestamptz

### invoices
- id: uuid PK DEFAULT gen_random_uuid()
- user_id: uuid FK profiles(id) NOT NULL
- client_id: uuid FK clients(id) NOT NULL
- invoice_number: text NOT NULL
- amount: numeric NOT NULL
- issued_date: date NOT NULL
- due_date: date NOT NULL
- paid_date: date
- status: enum (draft, issued, pending, due_soon, overdue, in_collection, paid)
- payment_terms: text (shotef_30, shotef_60, shotef_90, cash, custom)
- notes: text
- created_at/updated_at: timestamptz

### transactions
- id: uuid PK
- user_id: uuid FK profiles(id) NOT NULL
- type: enum (income, expense)
- description: text NOT NULL
- amount: numeric NOT NULL
- date: date NOT NULL
- category: text
- is_recurring: boolean DEFAULT false
- recurrence_day: int (1-31)
- linked_invoice_id: uuid FK invoices(id)
- is_forecast: boolean DEFAULT false
- created_at/updated_at: timestamptz

### whatsapp_messages
- id: uuid PK
- user_id: uuid FK profiles(id) NOT NULL
- invoice_id: uuid FK invoices(id)
- client_id: uuid FK clients(id) NOT NULL
- template_tone: enum (gentle, business, firm)
- message_text: text NOT NULL
- include_payment_link: boolean DEFAULT false
- sent_at: timestamptz DEFAULT now()
- delivered_at: timestamptz
- read_at: timestamptz
- status: enum (sent, delivered, read, failed)
- whatsapp_message_id: text

### settings
- id: uuid PK
- user_id: uuid FK profiles(id) UNIQUE NOT NULL
- cash_threshold: numeric DEFAULT 20000
- alert_days_before_due: int DEFAULT 3
- weekly_summary_email: boolean DEFAULT true
- sms_alerts: boolean DEFAULT false
- whatsapp_connected: boolean DEFAULT false
- whatsapp_phone: text
- whatsapp_templates: jsonb
- plan: enum (basic, pro) DEFAULT 'pro'
- plan_expires_at: timestamptz
