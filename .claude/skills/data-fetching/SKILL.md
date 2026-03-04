---
name: data-fetching
description: |
  Data fetching strategy for CashPulse — Next.js caching, revalidation, parallel fetching,
  Suspense boundaries, and streaming. Use when deciding how to fetch data in Server Components,
  when to use cache() vs revalidatePath vs revalidateTag, or how to structure loading states.
  Trigger on: fetch, cache, revalidate, Suspense, loading, parallel, streaming, unstable_noStore,
  server component data, stale data.
---

# Data Fetching Strategy for CashPulse

## Decision Tree

```
Is the data needed on first render?
├── YES → Server Component fetch (direct Supabase query)
│   ├── Changes often (per-user, financial) → unstable_noStore() or revalidate: 0
│   ├── Changes on mutation → revalidateTag / revalidatePath in Server Action
│   └── Rarely changes (settings, plan) → cache() with revalidate: 3600
└── NO → Client-side via Zustand action after interaction
```

## Server Component — Direct Query (default pattern)

```tsx
// src/app/(dashboard)/receivables/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { unstable_noStore } from 'next/cache'

export default async function ReceivablesPage() {
  // Financial data must always be fresh — never serve stale debt list
  unstable_noStore()

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get company_id first
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user!.id)
    .single()

  const { data: debts } = await supabase
    .from('debts')
    .select(`
      id, title, amount_outstanding, currency, due_date, status,
      overdue_days, expected_payment_date, last_reminder_sent_at,
      clients ( id, name, reliability_score )
    `)
    .eq('company_id', userData!.company_id)
    .neq('status', 'paid')
    .order('due_date', { ascending: true })

  return <ReceivablesList initialDebts={debts ?? []} />
}
```

## Parallel Fetching (avoid waterfalls)

```tsx
// ❌ Waterfall — each awaits before the next starts
const userData = await getUser()
const debts = await getDebts(userData.company_id)
const clients = await getClients(userData.company_id)

// ✅ Parallel — all start simultaneously
const [userData, debtsResult, clientsResult] = await Promise.all([
  supabase.from('users').select('company_id').eq('id', userId).single(),
  supabase.from('debts').select('*').eq('company_id', companyId),
  supabase.from('clients').select('*').eq('company_id', companyId),
])
```

## Suspense + Streaming (per-section loading)

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'
import { KPISkeleton, ForecastSkeleton, ActivitySkeleton } from '@/components/ui/skeletons'

export default function DashboardPage() {
  // Each section streams independently — page renders immediately
  return (
    <div className="grid grid-cols-1 gap-6">
      <Suspense fallback={<KPISkeleton />}>
        <KPISection />         {/* Fetches KPI data */}
      </Suspense>

      <Suspense fallback={<ForecastSkeleton />}>
        <ForecastChart />      {/* Fetches forecast data */}
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <ActivityFeed />       {/* Fetches activity log */}
      </Suspense>
    </div>
  )
}
```

## Caching Strategy by Data Type

| Data type | Cache strategy | Rationale |
|---|---|---|
| Debt list | `unstable_noStore()` | Financial data — always fresh |
| Dashboard KPIs | `unstable_noStore()` | Changes on every payment |
| Client list | `revalidateTag('clients')` | Changes on CRUD only |
| Settings | `cache()` + `revalidate: 3600` | Rarely changes |
| Activity log | `unstable_noStore()` | Append-only, always fresh |
| Prediction data | `revalidateTag('predictions')` | Updated by prediction job |

## Revalidation in Server Actions

```ts
// src/features/receivables/api/actions.ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function createDebt(input: CreateDebtInput): Promise<ActionResult> {
  // ... create debt in DB ...

  // Revalidate specific paths and tags
  revalidatePath('/receivables')
  revalidatePath('/dashboard')
  revalidateTag('debts')   // All pages using tag('debts') get fresh data

  return { success: true, data: { id: debt.id } }
}

// In the Server Component fetch, tag the query:
import { unstable_cache } from 'next/cache'

const getCachedClients = unstable_cache(
  async (companyId: string) => {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('clients')
      .select('id, name, reliability_score')
      .eq('company_id', companyId)
    return data ?? []
  },
  ['clients'],
  { tags: ['clients'], revalidate: false }
)
```

## Loading UI (Skeleton → Content)

```tsx
// src/app/(dashboard)/receivables/loading.tsx
// This file automatically wraps the page in Suspense
import { DebtListSkeleton } from '@/features/receivables/components/DebtListSkeleton'

export default function Loading() {
  return <DebtListSkeleton />
}
```

## Data Passing Pattern (Server → Client)

```tsx
// ✅ Correct — Server fetches, passes down as props
// Server Component
async function ReceivablesPage() {
  const debts = await fetchDebts()
  return <DebtList initialDebts={debts} />  // Client Component receives data
}

// Client Component uses initialDebts for first render,
// Zustand store takes over for subsequent updates (Realtime, optimistic)
'use client'
function DebtList({ initialDebts }: { initialDebts: Debt[] }) {
  const [debts, setDebts] = useState(initialDebts)
  // ... Realtime subscription updates debts state
}
```

## Avoid These Patterns

```ts
// ❌ Never fetch in Client Components for initial data
'use client'
function DebtList() {
  const [debts, setDebts] = useState([])
  useEffect(() => {
    fetch('/api/debts').then(...)  // Extra roundtrip, waterfall, no SSR
  }, [])
}

// ❌ Never use getServerSideProps / getStaticProps (App Router!)
// ❌ Never cache financial/user-specific data with long revalidate
// ❌ Never await sequentially when queries are independent
```

## Error Handling in Data Fetching

```tsx
// Supabase always returns { data, error } — always check error
const { data: debts, error } = await supabase.from('debts').select('*')

if (error) {
  // In Server Components — throw to trigger error.tsx boundary
  console.error('[fetchDebts]', error)
  throw new Error('שגיאה בטעינת החובות')
}

// error.tsx will catch and show Hebrew error UI
```
