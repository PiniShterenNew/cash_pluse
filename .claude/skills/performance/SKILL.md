---
name: performance
description: |
  Performance optimization for CashPulse — list virtualization, React.memo, bundle
  splitting, image optimization, and Lighthouse checklist for RTL Hebrew apps. Use when
  building large lists, optimizing re-renders, reducing bundle size, or preparing for
  production. Trigger on: performance, slow, virtualize, memo, bundle, optimize, lazy,
  Lighthouse, FCP, LCP, CLS, re-render.
---

# Performance for CashPulse

## List Virtualization (large debt lists)

When debt list exceeds ~100 rows, use `@tanstack/react-virtual` to render only visible rows.

```tsx
// src/features/receivables/components/VirtualDebtList.tsx
'use client'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import type { Debt } from '../types/debt.types'

interface Props {
  debts: Debt[]
}

export function VirtualDebtList({ debts }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: debts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,      // Estimated row height in px
    overscan: 5,                 // Render 5 rows outside visible area
  })

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: 'calc(100vh - 200px)' }}   // Scrollable container
    >
      {/* Total height spacer */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const debt = debts[virtualRow.index]!
          return (
            <div
              key={debt.id}
              style={{
                position: 'absolute',
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                width: '100%',
                height: `${virtualRow.size}px`,
              }}
            >
              <DebtRow debt={debt} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

## React.memo — When and When Not

```tsx
// ✅ Use memo for: list items that receive stable props, expensive renders
export const DebtRow = memo(function DebtRow({ debt, onSelect, onRemind }: DebtRowProps) {
  return (/* heavy render */)
}, (prev, next) => {
  // Custom comparison — only re-render if these fields change
  return (
    prev.debt.id === next.debt.id &&
    prev.debt.status === next.debt.status &&
    prev.debt.amount_outstanding === next.debt.amount_outstanding &&
    prev.isSelected === next.isSelected
  )
})

// ❌ Don't memo: simple components, ones that always get new props
// ❌ Don't memo: components that use useContext (they re-render anyway)
// ✅ Stabilize callback props with useCallback in parent:
const handleSelect = useCallback((id: string) => {
  setSelected((prev) => [...prev, id])
}, [])  // Stable reference — DebtRow won't re-render due to callback change
```

## useMemo for Expensive Computations

```tsx
// Filter + sort in the browser (don't re-compute on every render)
const filteredDebts = useMemo(() => {
  let result = debts

  if (filters.status !== 'all') {
    result = result.filter((d) => d.status === filters.status)
  }

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter((d) =>
      d.clientName?.toLowerCase().includes(q) ||
      d.invoice_reference?.toLowerCase().includes(q)
    )
  }

  return result.sort((a, b) => {
    if (filters.sortBy === 'due_date') {
      return filters.sortDir === 'asc'
        ? a.due_date.localeCompare(b.due_date)
        : b.due_date.localeCompare(a.due_date)
    }
    if (filters.sortBy === 'amount') {
      return filters.sortDir === 'asc'
        ? a.amount_outstanding - b.amount_outstanding
        : b.amount_outstanding - a.amount_outstanding
    }
    return 0
  })
}, [debts, filters])

// ⚠️ Only use useMemo when: computation > 1ms OR result is used as dependency elsewhere
// Don't over-memo simple transforms
```

## Bundle Splitting — Dynamic Imports

```tsx
// Heavy components loaded only when needed
import dynamic from 'next/dynamic'

// Recharts is large — only load on the forecast page
const ForecastChart = dynamic(
  () => import('@/features/cashflow/components/ForecastChart').then((m) => m.ForecastChart),
  {
    loading: () => <ForecastChartSkeleton />,
    ssr: false,  // Charts don't need SSR
  }
)

// PDF export — rarely used, large library
const PdfExport = dynamic(
  () => import('@/features/reports/components/PdfExport').then((m) => m.PdfExport),
  { ssr: false }
)

// WhatsApp composer — modal content, loaded on open
const WhatsAppComposer = dynamic(
  () => import('@/features/whatsapp/components/WhatsAppComposer').then((m) => m.WhatsAppComposer),
  { loading: () => <ComposerSkeleton /> }
)
```

## Image Optimization

```tsx
// Always use Next.js Image component
import Image from 'next/image'

// Client logos / avatars
<Image
  src={client.logoUrl ?? '/avatars/default.png'}
  alt={`לוגו ${client.name}`}
  width={40}
  height={40}
  className="rounded-full"
/>

// next.config.js — allow Supabase storage images
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
```

## Database Query Performance

```ts
// ✅ Select only needed columns — never select *
const { data } = await supabase
  .from('debts')
  .select('id, status, amount_outstanding, due_date, client_id')  // Not *
  .eq('company_id', companyId)

// ✅ Paginate large queries
const { data } = await supabase
  .from('debts')
  .select('*', { count: 'exact' })
  .range(0, 19)  // First 20 rows

// ✅ Use indexes (already defined in migrations):
// debts: (company_id, status, due_date) — covers most filter combinations
// Never filter by columns without indexes on large tables
```

## React Transition for Non-Urgent Updates

```tsx
// Wrap filter changes in transition — won't block urgent updates (typing, clicks)
import { useTransition } from 'react'

function FilterBar() {
  const [isPending, startTransition] = useTransition()
  const setFilter = useReceivablesStore((s) => s.setFilter)

  function handleStatusChange(status: DebtStatus | 'all') {
    startTransition(() => {
      setFilter('status', status)
    })
  }

  return (
    <div className={isPending ? 'opacity-70' : ''}>
      {/* filter tabs */}
    </div>
  )
}
```

## Lighthouse Checklist for CashPulse RTL

| Metric | Target | Common Issues in RTL |
|---|---|---|
| LCP | < 2.5s | Hero image not preloaded, large fonts |
| FCP | < 1.8s | Blocking fonts (Varela Round, Rubik) |
| CLS | < 0.1 | Hebrew font swap shifts layout |
| TBT | < 200ms | Large JS bundle blocking main thread |

```tsx
// Fix font CLS — preload Hebrew fonts
// src/app/layout.tsx
export default function RootLayout() {
  return (
    <html dir="rtl" lang="he">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical font weights */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4i1UA.woff2"
          as="font" type="font/woff2" crossOrigin="anonymous"
        />
      </head>
      <body className="font-body antialiased">{/* ... */}</body>
    </html>
  )
}
```

## Rules
- Virtualize lists with >50 rows (debt list, client list, activity log)
- `React.memo` only for list items and heavy components — not for everything
- `useMemo` for filter+sort logic — computed from large arrays
- Dynamic import Recharts, PDF libs, and any modal content >20KB
- Always paginate DB queries — never fetch all debts in one query
- Use `startTransition` for filter changes so typing stays responsive
