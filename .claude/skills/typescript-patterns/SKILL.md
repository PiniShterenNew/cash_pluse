---
name: typescript-patterns
description: |
  TypeScript strict mode patterns for CashPulse. Use when defining types, interfaces,
  generics, discriminated unions, type guards, or ensuring no-any compliance. Trigger on:
  typescript, type, interface, generic, union, any, strict, infer, satisfies, as const,
  type guard, narrowing.
---

# TypeScript Patterns for CashPulse

## Configuration
TypeScript strict mode is ON — this means:
- `noImplicitAny: true` — NEVER use `any`, use `unknown` then narrow
- `strictNullChecks: true` — always handle null/undefined explicitly
- `noUncheckedIndexedAccess: true` — array access returns `T | undefined`

## Domain Types (canonical)

```ts
// src/features/receivables/types/debt.types.ts

export type DebtStatus =
  | 'draft'
  | 'open'
  | 'due_today'
  | 'overdue'
  | 'partially_paid'
  | 'paid'
  | 'canceled'
  | 'disputed'

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export type ReminderStatus =
  | 'draft'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'

// Extend from DB types — never duplicate
import type { Database } from '@/lib/database.types'

export type DbDebt = Database['public']['Tables']['debts']['Row']
export type DbDebtInsert = Database['public']['Tables']['debts']['Insert']
export type DbDebtUpdate = Database['public']['Tables']['debts']['Update']

// Domain type extends DB type for business-layer use
export interface Debt extends DbDebt {
  // Computed/joined fields
  clientName?: string
  overdueDays: number
}
```

## Discriminated Unions — Use for State Machines

```ts
// Great for async states, results, payment flows
type DebtLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Debt[] }
  | { status: 'error'; error: string }

// Exhaustive switch — TypeScript catches missing branches
function renderState(state: DebtLoadState): string {
  switch (state.status) {
    case 'idle':    return 'בחר פילטר'
    case 'loading': return 'טוען...'
    case 'success': return `${state.data.length} חובות`
    case 'error':   return `שגיאה: ${state.error}`
    // No default needed — TypeScript ensures exhaustiveness
  }
}
```

## Type Guards

```ts
// Narrow unknown to known type
function isPayPlusWebhookEvent(value: unknown): value is PayPlusWebhookEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'transaction_uid' in value &&
    'status' in value &&
    typeof (value as { transaction_uid: unknown }).transaction_uid === 'string'
  )
}

// Usage
const payload = JSON.parse(rawBody)
if (!isPayPlusWebhookEvent(payload)) {
  return { success: false, error: 'Invalid payload' }
}
// Now payload is typed as PayPlusWebhookEvent
```

## `satisfies` Operator — Validate Without Widening

```ts
// Validate configuration objects without losing literal types
const STATUS_LABELS = {
  draft: 'טיוטה',
  open: 'פתוח',
  due_today: 'פירעון היום',
  overdue: 'באיחור',
  partially_paid: 'שולם חלקית',
  paid: 'שולם',
  canceled: 'בוטל',
  disputed: 'בסכסוך',
} satisfies Record<DebtStatus, string>  // TypeScript checks all statuses covered
// status_labels.draft is `string` not widened to `string`
```

## `as const` for Immutable Constants

```ts
// Prevents widening to string[], preserves literal types
export const DEBT_TERMINAL_STATUSES = ['paid', 'canceled'] as const
export type DebtTerminalStatus = typeof DEBT_TERMINAL_STATUSES[number]
// type is 'paid' | 'canceled'

// Check if status is terminal
function isTerminal(status: DebtStatus): status is DebtTerminalStatus {
  return (DEBT_TERMINAL_STATUSES as readonly string[]).includes(status)
}
```

## Generic Utility Types

```ts
// Pagination wrapper — used across all list queries
export interface PaginatedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

// Async action state — use with useReducer or useState
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Partial update with required ID
export type WithId<T> = T & { id: string }
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>> & { id: string }
```

## Never Use `any` — Use These Instead

| Instead of | Use |
|---|---|
| `any` for JSON | `Record<string, unknown>` or a typed interface |
| `any` for errors | `unknown` then narrow with instanceof |
| `any` for dynamic data | `unknown` then use type guard |
| `any[]` for arrays | `unknown[]` then narrow each element |
| `any` for function args | Proper generics |

```ts
// ❌ Wrong
function processWebhook(data: any) { ... }

// ✅ Correct
function processWebhook(data: unknown): PayPlusWebhookEvent {
  if (!isPayPlusWebhookEvent(data)) {
    throw new Error('Invalid webhook payload')
  }
  return data
}
```

## Error Narrowing

```ts
// ❌ Wrong
catch (err) {
  console.error(err.message)  // err is unknown!
}

// ✅ Correct
catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error('[context]', message)
  return { success: false, error: 'שגיאה לא צפויה' }
}
```

## Component Prop Types

```ts
// Named interface for props — not inline
interface DebtRowProps {
  debt: Debt
  isSelected: boolean
  onSelect: (id: string) => void
  onSendReminder: (debtId: string) => Promise<void>
}

// Function component — always type props explicitly
export function DebtRow({ debt, isSelected, onSelect, onSendReminder }: DebtRowProps) {
  // ...
}

// Children prop
interface CardProps {
  children: React.ReactNode
  className?: string
}
```

## Optional Chaining & Nullish Coalescing

```ts
// Prefer these over manual null checks
const score = client?.reliabilityScore ?? 50
const label = debt.status === 'overdue' ? 'באיחור' : STATUS_LABELS[debt.status]

// Array access (noUncheckedIndexedAccess — first item might be undefined)
const firstDebt = debts[0]
if (!firstDebt) return null  // Must check
```

## Import Type — Always for Type-Only Imports

```ts
// ✅ Use `import type` for types — removes runtime overhead
import type { Debt, DebtStatus } from './debt.types'
import type { Database } from '@/lib/database.types'

// Runtime values still use regular import
import { DEBT_TERMINAL_STATUSES } from './debt.constants'
```

## Rules
- `any` is FORBIDDEN — CI will fail on explicit `any` usage
- Use `unknown` for external data, then narrow with type guards
- Extend DB types from `database.types.ts` — never manually recreate DB types
- All discriminated unions need exhaustive handling (use `switch` without `default`)
- Export types from feature's `types/` folder, not from component files
