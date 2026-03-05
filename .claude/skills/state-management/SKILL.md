---
name: state-management
description: |
  Zustand state management patterns for CashPulse. Use when creating stores, managing
  feature state, handling async actions, optimistic updates, or deciding what state
  belongs in Zustand vs server. Trigger on: store, state, zustand, useState, global state,
  filter, selection, modal state, optimistic.
---

# State Management — Zustand for CashPulse

## Core Principle
- **Server state** (DB data) → Server Components + Supabase queries directly
- **UI state** (filters, selections, modal open, loading) → Zustand
- **Form state** → react-hook-form (local to form component)
- Do NOT use Zustand as a fetch cache — that's Supabase's job

## Store Location
- Feature stores: `src/features/[feature]/store.ts`
- Cross-feature stores: `src/stores/[name]Store.ts`
- One store per feature domain

## Store Pattern (canonical)

```ts
// src/features/receivables/store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { DebtStatus } from './types/debt.types'

interface ReceivablesFilters {
  status: DebtStatus | 'all'
  clientId: string | null
  search: string
  sortBy: 'due_date' | 'amount' | 'client_name'
  sortDir: 'asc' | 'desc'
}

interface ReceivablesState {
  // UI state
  filters: ReceivablesFilters
  selectedDebtIds: string[]
  activeDebtId: string | null
  isComposerOpen: boolean

  // Optimistic updates
  optimisticUpdates: Record<string, Partial<{ status: DebtStatus }>>

  // Actions
  setFilter: <K extends keyof ReceivablesFilters>(
    key: K,
    value: ReceivablesFilters[K]
  ) => void
  resetFilters: () => void
  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  openComposer: (debtId: string) => void
  closeComposer: () => void
  applyOptimisticUpdate: (debtId: string, patch: Partial<{ status: DebtStatus }>) => void
  revertOptimisticUpdate: (debtId: string) => void
}

const DEFAULT_FILTERS: ReceivablesFilters = {
  status: 'all',
  clientId: null,
  search: '',
  sortBy: 'due_date',
  sortDir: 'asc',
}

export const useReceivablesStore = create<ReceivablesState>()(
  devtools(
    (set) => ({
      filters: DEFAULT_FILTERS,
      selectedDebtIds: [],
      activeDebtId: null,
      isComposerOpen: false,
      optimisticUpdates: {},

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      toggleSelect: (id) =>
        set((s) => ({
          selectedDebtIds: s.selectedDebtIds.includes(id)
            ? s.selectedDebtIds.filter((x) => x !== id)
            : [...s.selectedDebtIds, id],
        })),

      selectAll: (ids) => set({ selectedDebtIds: ids }),
      clearSelection: () => set({ selectedDebtIds: [] }),

      openComposer: (debtId) =>
        set({ activeDebtId: debtId, isComposerOpen: true }),

      closeComposer: () =>
        set({ activeDebtId: null, isComposerOpen: false }),

      applyOptimisticUpdate: (debtId, patch) =>
        set((s) => ({
          optimisticUpdates: { ...s.optimisticUpdates, [debtId]: patch },
        })),

      revertOptimisticUpdate: (debtId) =>
        set((s) => {
          const { [debtId]: _, ...rest } = s.optimisticUpdates
          return { optimisticUpdates: rest }
        }),
    }),
    { name: 'receivables-store' }
  )
)
```

## Selectors — Always Memoize

```ts
// In component — select only what you need
const filters = useReceivablesStore((s) => s.filters)
const isComposerOpen = useReceivablesStore((s) => s.isComposerOpen)

// Derived selector with useShallow for objects
import { useShallow } from 'zustand/react/shallow'
const { selectedDebtIds, clearSelection } = useReceivablesStore(
  useShallow((s) => ({ selectedDebtIds: s.selectedDebtIds, clearSelection: s.clearSelection }))
)
```

## Optimistic Updates Pattern

```ts
// In a Server Action caller (Client Component)
async function handleStatusChange(debtId: string, newStatus: DebtStatus) {
  const { applyOptimisticUpdate, revertOptimisticUpdate } = useReceivablesStore.getState()

  // 1. Apply optimistic update immediately
  applyOptimisticUpdate(debtId, { status: newStatus })

  try {
    // 2. Call server action
    const result = await updateDebtStatus(debtId, newStatus)
    if (!result.success) throw new Error(result.error)
    // 3. On success: clear optimistic (server data will refresh via revalidatePath)
    revertOptimisticUpdate(debtId)
  } catch {
    // 4. On failure: revert
    revertOptimisticUpdate(debtId)
    toast.error('שגיאה בעדכון הסטטוס')
  }
}
```

## What Goes in Zustand vs Where

| State type | Location |
|---|---|
| List data from DB | Server Component (fetch directly) |
| Filter/sort params | Zustand store |
| Selected rows | Zustand store |
| Modal open/close | Zustand store |
| Form values | react-hook-form |
| Loading (server action) | useTransition / useState |
| Realtime subscription data | Zustand store (updated via Supabase subscription) |
| Auth user | Supabase auth helpers (`useUser`) |

## Realtime + Zustand Integration

```ts
// In a hook: src/features/receivables/hooks/useDebtRealtime.ts
'use client'
import { useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useReceivablesStore } from '../store'

export function useDebtRealtime(companyId: string) {
  const applyOptimisticUpdate = useReceivablesStore((s) => s.applyOptimisticUpdate)

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel('debts-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'debts',
          filter: `company_id=eq.${companyId}` },
        (payload) => {
          // Update optimistic state OR trigger router refresh
          applyOptimisticUpdate(payload.new.id, { status: payload.new.status })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [companyId, applyOptimisticUpdate])
}
```

## Rules
- Always use `devtools` middleware in development
- Use `useShallow` when selecting multiple values to prevent re-renders
- Never call `getState()` inside render — only in event handlers and async functions
- Store name in devtools must match feature name
- Reset store on logout: listen to auth state change
