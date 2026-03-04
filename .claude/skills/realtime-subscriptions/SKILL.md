---
name: realtime-subscriptions
description: |
  Supabase Realtime subscription patterns for CashPulse — live Kanban updates, payment
  status changes, dashboard refresh, channel management, reconnection, and cleanup.
  Use when building live UI updates, subscribing to DB changes, or handling WebSocket
  connections. Trigger on: realtime, subscription, live, WebSocket, channel, postgres_changes,
  payment received, status update, live kanban, dashboard refresh.
---

# Realtime Subscriptions for CashPulse

## Architecture
- Supabase Realtime = PostgreSQL logical replication → WebSocket → browser
- CashPulse uses Realtime for: Kanban status updates, payment confirmations, reminder delivery status
- Pattern: Server Component fetches initial data → Client Component subscribes for updates

## Core Hook Pattern

```ts
// src/features/receivables/hooks/useDebtRealtime.ts
'use client'
import { useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type DebtRow = Database['public']['Tables']['debts']['Row']

interface UseDebtRealtimeOptions {
  companyId: string
  onUpdate: (payload: RealtimePostgresChangesPayload<DebtRow>) => void
  onInsert?: (payload: RealtimePostgresChangesPayload<DebtRow>) => void
}

export function useDebtRealtime({ companyId, onUpdate, onInsert }: UseDebtRealtimeOptions) {
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`debts:company:${companyId}`)  // Unique channel name per company
      .on<DebtRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'debts',
          filter: `company_id=eq.${companyId}`,
        },
        onUpdate
      )
      .on<DebtRow>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'debts',
          filter: `company_id=eq.${companyId}`,
        },
        onInsert ?? (() => {})
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug('[Realtime] Debts channel connected')
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Debts channel error')
        }
      })

    // ALWAYS clean up on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId]) // Only resubscribe if companyId changes
}
```

## Kanban Live Updates

```tsx
// src/features/receivables/components/KanbanBoard.tsx
'use client'
import { useState } from 'react'
import { useDebtRealtime } from '../hooks/useDebtRealtime'
import type { Debt } from '../types/debt.types'

interface Props {
  initialDebts: Debt[]
  companyId: string
}

export function KanbanBoard({ initialDebts, companyId }: Props) {
  const [debts, setDebts] = useState<Debt[]>(initialDebts)

  useDebtRealtime({
    companyId,
    onUpdate: (payload) => {
      setDebts((prev) =>
        prev.map((d) =>
          d.id === payload.new.id
            ? { ...d, ...payload.new }  // Merge updated fields
            : d
        )
      )
    },
    onInsert: (payload) => {
      // New debt added elsewhere — append to list
      setDebts((prev) => [...prev, payload.new as Debt])
    },
  })

  // Group debts by status for Kanban columns
  const columns: Record<string, Debt[]> = {
    open: debts.filter((d) => d.status === 'open'),
    overdue: debts.filter((d) => d.status === 'overdue'),
    partially_paid: debts.filter((d) => d.status === 'partially_paid'),
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Object.entries(columns).map(([status, items]) => (
        <KanbanColumn key={status} status={status} debts={items} />
      ))}
    </div>
  )
}
```

## Payment Confirmation — Live Toast

```tsx
// src/features/dashboard/hooks/usePaymentRealtime.ts
'use client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { createBrowserClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

export function usePaymentRealtime(companyId: string) {
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`payments:company:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          if (payload.new.status === 'succeeded') {
            toast.success(`תשלום התקבל! 🎉`, {
              description: `${formatCurrency(payload.new.amount)} נכנסו לחשבון`,
              duration: 6000,
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [companyId])
}
```

## Reminder Delivery Status

```tsx
// src/features/whatsapp/hooks/useReminderStatusRealtime.ts
'use client'
import { useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useReceivablesStore } from '@/features/receivables/store'

const STATUS_LABELS: Record<string, string> = {
  delivered: 'נמסר',
  read: 'נקרא ✓✓',
  failed: 'נכשל',
}

export function useReminderStatusRealtime(companyId: string) {
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`reminders:company:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reminders',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          const { status, debt_id } = payload.new
          if (status === 'read') {
            toast.success(`התזכורת נקראה ✓✓`, { description: 'הלקוח ראה את ההודעה' })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [companyId])
}
```

## Throttling Realtime Updates (prevent UI thrash)

```tsx
// When many updates arrive rapidly (e.g., bulk payment processing),
// debounce the state update to avoid excessive re-renders

import { useCallback, useRef } from 'react'

export function useDebtRealtimeThrottled({ companyId, onBatchUpdate }) {
  const supabase = createBrowserClient()
  const pendingUpdates = useRef<Map<string, DebtRow>>(new Map())
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(() => {
    if (pendingUpdates.current.size === 0) return
    const updates = Array.from(pendingUpdates.current.values())
    pendingUpdates.current.clear()
    onBatchUpdate(updates)
  }, [onBatchUpdate])

  useEffect(() => {
    const channel = supabase
      .channel(`debts-throttled:${companyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'debts',
          filter: `company_id=eq.${companyId}` },
        (payload) => {
          // Accumulate updates
          pendingUpdates.current.set(payload.new.id, payload.new as DebtRow)
          // Flush every 300ms max
          if (!flushTimer.current) {
            flushTimer.current = setTimeout(() => {
              flush()
              flushTimer.current = null
            }, 300)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (flushTimer.current) clearTimeout(flushTimer.current)
    }
  }, [companyId, flush])
}
```

## Reconnection Handling

```tsx
// Supabase Realtime auto-reconnects, but surface status to user
const channel = supabase
  .channel('debts')
  .subscribe((status, err) => {
    switch (status) {
      case 'SUBSCRIBED':
        setConnectionStatus('connected')
        break
      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
        setConnectionStatus('error')
        console.error('[Realtime] Channel error:', err)
        break
      case 'CLOSED':
        setConnectionStatus('disconnected')
        break
    }
  })
```

## Root Provider — One Connection Per Session

```tsx
// src/app/(dashboard)/layout.tsx
// Subscribe to cross-feature events at layout level
import { usePaymentRealtime } from '@/features/dashboard/hooks/usePaymentRealtime'
import { useReminderStatusRealtime } from '@/features/whatsapp/hooks/useReminderStatusRealtime'

function DashboardRealtimeProvider({ companyId, children }) {
  usePaymentRealtime(companyId)
  useReminderStatusRealtime(companyId)
  // Feature-specific subscriptions (Kanban, etc.) live in their own components
  return children
}
```

## Rules
- One channel per logical entity per company — name pattern: `{table}:company:{companyId}`
- ALWAYS return cleanup function from useEffect to call `supabase.removeChannel()`
- Never subscribe in Server Components — Realtime is client-only
- Subscribe at the lowest component level that needs it (Kanban), unless cross-feature (payments → root layout)
- Always filter by `company_id` in the Realtime filter — never subscribe to full table
- Throttle bulk updates (>5/second) to avoid React re-render storms
