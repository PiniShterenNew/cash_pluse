---
name: ui-patterns
description: |
  UI patterns for CashPulse — empty states, skeleton loaders, pagination, infinite scroll,
  toast positioning, confirmation dialogs, and data table patterns. Use when building list
  views, handling loading states, empty screens, or deciding between pagination strategies.
  Trigger on: empty state, skeleton, loading, pagination, infinite scroll, toast, table,
  list, ריק, טעינה, עמוד.
---

# UI Patterns for CashPulse

## Empty States

Every empty state has 3 elements: illustration (emoji-based), headline, CTA.
Tone: warm and encouraging — never clinical "No data found".

```tsx
// src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: string           // Emoji
  title: string          // Hebrew headline
  description?: string   // Hebrew subtext
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sand-100 text-4xl">
        {icon}
      </div>
      <div className="max-w-xs">
        <p className="text-lg font-semibold text-ink-800">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-ink-400">{description}</p>
        )}
      </div>
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-2">
          {action.label}
        </button>
      )}
    </div>
  )
}
```

### Per-Screen Empty States (canonical copy)

```tsx
// Receivables — no debts yet
<EmptyState
  icon="📑"
  title="עדיין אין חובות פתוחים"
  description="כשתוסיפו חוב ראשון, הוא יופיע כאן"
  action={{ label: '+ הוסף חוב ראשון', onClick: openCreateDebt }}
/>

// Receivables — no results for filter
<EmptyState
  icon="🔍"
  title="לא נמצאו חובות"
  description="נסו לשנות את הפילטרים"
  action={{ label: 'נקה פילטרים', onClick: resetFilters }}
/>

// Clients — empty
<EmptyState
  icon="👥"
  title="עדיין אין לקוחות"
  description="הוסיפו את הלקוח הראשון שלכם"
  action={{ label: '+ הוסף לקוח', onClick: openCreateClient }}
/>

// Activity — nothing yet
<EmptyState
  icon="🌱"
  title="הדשבורד מחכה לכם"
  description="הפעילות תופיע כאן ברגע שתתחילו לעבוד"
/>

// WhatsApp — not connected
<EmptyState
  icon="💬"
  title="WhatsApp עדיין לא מחובר"
  description="חברו את מספר העסק שלכם לשלוח תזכורות"
  action={{ label: 'חיבור WhatsApp', onClick: () => router.push('/settings/whatsapp') }}
/>
```

## Skeleton Loaders

Skeletons mirror the exact layout of content — not generic bars.
Use the shimmer animation from `cashpulse-design`.

```tsx
// src/components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-gradient-to-r from-sand-100 via-sand-50 to-sand-100',
        'bg-[length:200%_100%]',
        className
      )}
    />
  )
}

// Tailwind config animation:
// shimmer: 'shimmer 1.5s infinite linear'
// @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
```

```tsx
// src/features/receivables/components/DebtListSkeleton.tsx
export function DebtListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Filter bar skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-float">
          <Skeleton className="h-10 w-10 rounded-full" />          {/* Client avatar */}
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />                      {/* Client name */}
            <Skeleton className="h-3 w-24" />                      {/* Due date */}
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />           {/* Amount */}
          <Skeleton className="h-6 w-16 rounded-full" />           {/* Status badge */}
          <Skeleton className="h-8 w-24 rounded-full" />           {/* CTA button */}
        </div>
      ))}
    </div>
  )
}

// src/features/dashboard/components/KPISkeleton.tsx
export function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-5 shadow-float">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />    {/* Label */}
              <Skeleton className="h-8 w-32" />    {/* Value */}
              <Skeleton className="h-5 w-16 rounded-full" />  {/* Trend */}
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />   {/* Icon circle */}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Pagination vs Infinite Scroll

| Use case | Pattern |
|---|---|
| Receivables main list | **Pagination** — users need to jump to specific pages |
| Activity feed / timeline | **Infinite scroll** — chronological, no need to jump |
| Client search results | **Pagination** — bounded, needs page context |
| Audit log | **Load more button** — safer than auto-scroll for logs |

```tsx
// Pagination Component (RTL-aware)
export function Pagination({
  page, pageSize, total, onPageChange
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-ink-400">
        {start}–{end} מתוך {total.toLocaleString('he-IL')}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page + 1)}  // RTL: next is visually LEFT
          disabled={page >= totalPages}
          className="btn-ghost h-9 w-9 rounded-full p-0"
          aria-label="עמוד הבא"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="flex h-9 w-9 items-center justify-center text-sm font-medium">
          {page}
        </span>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-ghost h-9 w-9 rounded-full p-0"
          aria-label="עמוד קודם"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
```

```tsx
// Load More (activity feed)
export function LoadMoreButton({
  onLoadMore, isLoading, hasMore
}: {
  onLoadMore: () => void
  isLoading: boolean
  hasMore: boolean
}) {
  if (!hasMore) {
    return <p className="py-4 text-center text-sm text-ink-300">הכל טעון ✓</p>
  }
  return (
    <button
      onClick={onLoadMore}
      disabled={isLoading}
      className="btn-ghost w-full py-3 text-sm"
    >
      {isLoading ? 'טוען...' : 'טען עוד'}
    </button>
  )
}
```

## Confirmation Dialog

```tsx
// src/components/ui/ConfirmDialog.tsx
interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = 'אישור', variant = 'default',
  onConfirm, onCancel
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
         role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-ink-900">{title}</h2>
        <p className="mt-2 text-sm text-ink-500">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onCancel} className="btn-secondary">ביטול</button>
          <button
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// Usage:
// Delete debt → danger variant
<ConfirmDialog
  open={isOpen}
  title="מחיקת חוב"
  description="פעולה זו אינה הפיכה. החוב יימחק לצמיתות."
  confirmLabel="מחק"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setIsOpen(false)}
/>
```

## Data Table Row States

```tsx
// Every table/list row should support these visual states:
// default | hover | selected | loading (optimistic) | error

function DebtRow({ debt, isSelected, isOptimistic }: DebtRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl bg-white p-4 transition-all duration-200',
        'shadow-float hover:-translate-y-0.5 hover:shadow-lg',           // default hover
        isSelected && 'ring-2 ring-mint-400 ring-offset-1',              // selected
        isOptimistic && 'opacity-60 pointer-events-none',                // optimistic loading
      )}
    >
      {/* content */}
    </div>
  )
}
```

## Filter Chips

```tsx
// Active filters shown as dismissible pills
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1.5 text-xs font-medium text-mint-700">
      {label}
      <button onClick={onRemove} aria-label={`הסר פילטר ${label}`}
              className="hover:text-mint-900">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
```

## Toast Positioning (RTL)

```tsx
// sonner config — toasts appear top-center (works for both RTL/LTR)
// src/app/layout.tsx
import { Toaster } from 'sonner'

<Toaster
  position="top-center"
  toastOptions={{
    style: { fontFamily: 'Rubik, sans-serif', direction: 'rtl' },
    classNames: {
      success: 'bg-mint-50 border-mint-200 text-mint-800',
      error: 'bg-rose-50 border-rose-200 text-rose-800',
    },
  }}
/>
```
