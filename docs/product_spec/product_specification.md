# CashPulse Product Specification

## 1. Introduction
This document defines the functional system behavior, entities, statuses, and feature requirements for the CashPulse MVP.

## 2. Domain Model Summary
### 2.1 Primary Entities
- Company
- User
- Client
- Debt
- Payment
- Reminder
- ActivityLog
- PredictionSnapshot

### 2.2 Core Entity Relationships
- Company has many Users, Clients, Debts.
- Client has many Debts.
- Debt has many Payments and Reminders.
- All major write operations emit ActivityLog records.

## 3. Entity Specifications

### 3.1 Company
**Purpose:** Tenant boundary for data isolation.

**Fields:**
- id (UUID)
- name
- registration_number (optional)
- default_currency (ILS)
- timezone (default Asia/Jerusalem)
- whatsapp_config_status
- payplus_config_status
- created_at, updated_at

### 3.2 User
**Purpose:** Authenticated actor within a company.

**Fields:**
- id (UUID)
- company_id (FK)
- email
- full_name
- role (owner/member for MVP)
- is_active
- last_login_at
- created_at, updated_at

### 3.3 Client
**Purpose:** Debtor identity and communication endpoint.

**Fields:**
- id (UUID)
- company_id (FK)
- name
- contact_name (optional)
- phone_e164
- email (optional)
- external_reference (optional)
- reliability_score (0-100 nullable until computed)
- total_debt_open (materialized/derived)
- total_debt_paid (materialized/derived)
- created_at, updated_at, archived_at

### 3.4 Debt
**Purpose:** Payable obligation tracked by the system.

**Fields:**
- id (UUID)
- company_id (FK)
- client_id (FK)
- title (optional short descriptor)
- description (optional)
- invoice_reference (optional)
- amount_total
- amount_paid
- amount_outstanding
- currency
- issue_date (optional)
- due_date
- status (enum)
- overdue_days (derived)
- payment_link_url
- payment_link_provider_ref
- expected_payment_date (nullable)
- expected_payment_confidence (nullable)
- last_reminder_sent_at (nullable)
- created_by_user_id
- created_at, updated_at, closed_at (nullable)

**Debt Status Enum:**
- draft
- open
- due_today
- overdue
- partially_paid
- paid
- canceled
- disputed

### 3.5 Payment
**Purpose:** Record of payment events and amounts.

**Fields:**
- id (UUID)
- company_id (FK)
- debt_id (FK)
- provider (payplus)
- provider_transaction_id
- provider_event_id
- amount
- currency
- status (enum)
- paid_at (nullable)
- failure_reason (nullable)
- raw_payload (JSONB)
- created_at, updated_at

**Payment Status Enum:**
- initiated
- pending
- succeeded
- failed
- refunded
- partially_refunded

### 3.6 Reminder
**Purpose:** Outbound collection communication log.

**Fields:**
- id (UUID)
- company_id (FK)
- debt_id (FK)
- client_id (FK)
- channel (whatsapp)
- template_key
- rendered_message
- status (enum)
- provider_message_id
- sent_by_user_id
- sent_at
- delivered_at (nullable)
- read_at (nullable)
- failure_reason (nullable)
- created_at, updated_at

**Reminder Status Enum:**
- draft
- queued
- sent
- delivered
- read
- failed

### 3.7 ActivityLog
**Purpose:** Immutable timeline of significant actions.

**Fields:**
- id (UUID)
- company_id (FK)
- actor_type (user/system/webhook)
- actor_id (nullable)
- entity_type (client/debt/payment/reminder)
- entity_id
- action
- metadata (JSONB)
- created_at

### 3.8 PredictionSnapshot
**Purpose:** Store AI outputs for explainability and history.

**Fields:**
- id (UUID)
- company_id (FK)
- subject_type (debt/client)
- subject_id
- model_version
- expected_payment_date (nullable)
- reliability_score (nullable)
- confidence_score
- explanation (JSONB)
- generated_at

## 4. Feature Definitions

### 4.1 Create Debt
- Validates company context and client ownership.
- Creates debt row with status based on due date and amount.
- Triggers payment link generation job.
- Logs activity event.

### 4.2 View Receivables
- Returns paginated list of open/overdue/partially_paid debts.
- Supports search by client, invoice reference, amount range.
- Supports sorting and saved filter presets.

### 4.3 Send Reminder
- Requires debt status not in paid/canceled.
- Uses template + personalization tokens.
- Sends message through WhatsApp adapter.
- Creates reminder record and updates debt.last_reminder_sent_at.

### 4.4 Process Payment Webhook
- Verifies provider signature and timestamp.
- Writes idempotency marker.
- Upserts payment event.
- Recomputes debt aggregate amounts and status.
- Emits activity log and realtime updates.

### 4.5 Prediction Update
- Triggered daily and on relevant events (new payment/reminder).
- Writes PredictionSnapshot and copies latest values to debt/client read model fields.

## 5. Status Transition Rules (High-Level)
- open -> due_today when due_date = today and outstanding > 0
- open/due_today -> overdue when due_date < today and outstanding > 0
- open/overdue -> partially_paid on successful partial payment
- partially_paid -> paid when outstanding reaches 0
- any unpaid -> canceled only by manual action with reason
- paid is terminal except refund/dispute events

## 6. Validation Rules
- amount_total > 0
- amount_paid >= 0 and <= amount_total
- due_date required for MVP
- phone numbers normalized to E.164 before reminder send
- currency immutable after first successful payment

## 7. Security and Compliance Requirements
- Row-level security by company_id on all business tables.
- Webhook endpoints exempt from user auth but protected via signature verification.
- Sensitive payloads stored with retention policy and redaction where needed.

## 8. Observability Requirements
- Structured logs with correlation IDs per request/webhook.
- Retry queue metrics for failed reminder sends.
- Dead letter handling for unrecoverable webhook events.
