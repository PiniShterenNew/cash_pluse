# CashPulse Data Models

## 1. TypeScript Domain Interfaces (Reference)
```ts
export type DebtStatus =
  | 'draft'
  | 'open'
  | 'due_today'
  | 'overdue'
  | 'partially_paid'
  | 'paid'
  | 'canceled'
  | 'disputed';

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type ReminderStatus =
  | 'draft'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  defaultCurrency: 'ILS' | string;
  timezone: string;
  whatsappConfigStatus: 'not_connected' | 'connected' | 'error';
  payplusConfigStatus: 'not_connected' | 'connected' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  contactName?: string;
  phoneE164: string;
  email?: string;
  reliabilityScore?: number;
  totalDebtOpen: number;
  totalDebtPaid: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface Debt {
  id: string;
  companyId: string;
  clientId: string;
  invoiceReference?: string;
  amountTotal: number;
  amountPaid: number;
  amountOutstanding: number;
  currency: string;
  dueDate: string;
  status: DebtStatus;
  overdueDays: number;
  paymentLinkUrl?: string;
  expectedPaymentDate?: string;
  expectedPaymentConfidence?: 'low' | 'medium' | 'high';
  lastReminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  companyId: string;
  debtId: string;
  provider: 'payplus';
  providerTransactionId?: string;
  providerEventId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
  failureReason?: string;
  rawPayload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  companyId: string;
  debtId: string;
  clientId: string;
  channel: 'whatsapp';
  templateKey: string;
  renderedMessage: string;
  status: ReminderStatus;
  providerMessageId?: string;
  sentByUserId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;
}
```

## 2. Read Model: Receivables List Item
```ts
export interface ReceivableListItem {
  debtId: string;
  clientId: string;
  clientName: string;
  clientReliabilityScore?: number;
  amountOutstanding: number;
  currency: string;
  dueDate: string;
  overdueDays: number;
  status: DebtStatus;
  expectedPaymentDate?: string;
  expectedPaymentConfidence?: 'low' | 'medium' | 'high';
  lastReminderSentAt?: string;
}
```

## 3. Derived Fields and Ownership
- `debts.amount_outstanding`: owned by payment reconciliation transaction.
- `debts.overdue_days`: recomputed daily or query-derived.
- `clients.total_debt_open`: maintained by trigger/job for list performance.
- `clients.reliability_score`: owned by Prediction Service.

## 4. Serialization Rules
- Currency values use decimal-safe server logic; avoid float rounding in critical paths.
- Dates stored as ISO or `date` types; displayed according to locale formatting rules.
- Provider raw payload retained unmodified in JSONB for replay/debug.
