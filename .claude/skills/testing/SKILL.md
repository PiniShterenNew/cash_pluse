---
name: testing
description: |
  Testing patterns for CashPulse using Vitest and React Testing Library. Use when writing
  unit tests, component tests, hook tests, server action tests, or setting up test
  infrastructure. Trigger on: test, vitest, RTL, jest, mock, coverage, describe, it, expect,
  TDD, unit test, integration test.
---

# Testing for CashPulse — Vitest + RTL

## Setup
- **Runner:** Vitest with happy-dom environment
- **Components:** React Testing Library (RTL)
- **Location:** Colocated — `Component.test.tsx` next to `Component.tsx`
- **Philosophy:** TDD — red → green → refactor

## Vitest Config (reference)

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    alias: { '@': resolve(__dirname, './src') },
  },
})
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client globally
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    // add other methods as needed
  })),
}))
```

## Component Test Pattern

```tsx
// src/features/receivables/components/DebtStatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { DebtStatusBadge } from './DebtStatusBadge'

describe('DebtStatusBadge', () => {
  it('shows overdue label in Hebrew', () => {
    render(<DebtStatusBadge status="overdue" />)
    expect(screen.getByText('באיחור')).toBeInTheDocument()
  })

  it('applies danger color for overdue', () => {
    const { container } = render(<DebtStatusBadge status="overdue" />)
    expect(container.firstChild).toHaveClass('bg-danger-100')
  })

  it('shows paid label', () => {
    render(<DebtStatusBadge status="paid" />)
    expect(screen.getByText('שולם')).toBeInTheDocument()
  })
})
```

## Hook Test Pattern

```ts
// src/features/receivables/hooks/useDebtFilters.test.ts
import { renderHook, act } from '@testing-library/react'
import { useReceivablesStore } from '../store'

// Reset store state between tests
beforeEach(() => {
  useReceivablesStore.setState({
    filters: { status: 'all', clientId: null, search: '', sortBy: 'due_date', sortDir: 'asc' },
    selectedDebtIds: [],
  })
})

describe('useReceivablesStore', () => {
  it('sets filter correctly', () => {
    const { result } = renderHook(() => useReceivablesStore())

    act(() => {
      result.current.setFilter('status', 'overdue')
    })

    expect(result.current.filters.status).toBe('overdue')
  })

  it('toggles selection', () => {
    const { result } = renderHook(() => useReceivablesStore())

    act(() => result.current.toggleSelect('debt-1'))
    expect(result.current.selectedDebtIds).toContain('debt-1')

    act(() => result.current.toggleSelect('debt-1'))
    expect(result.current.selectedDebtIds).not.toContain('debt-1')
  })
})
```

## Server Action Test Pattern

```ts
// src/features/receivables/api/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createServerClient } from '@/lib/supabase/server'
import { createDebt } from './actions'

describe('createDebt', () => {
  const mockSupabase = {
    auth: { getUser: vi.fn() },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSupabase.single.mockResolvedValueOnce({
      data: { company_id: 'company-1' },
    })
  })

  it('returns error for invalid input', async () => {
    const result = await createDebt({
      clientId: 'not-a-uuid',
      amountTotal: -100,
      currency: 'ILS',
      dueDate: '2026-04-10',
      title: 'Test',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('נתונים לא תקינים')
  })

  it('creates debt successfully', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'debt-123' },
    })

    const result = await createDebt({
      clientId: '9f6f9f57-42b2-4f35-8c1d-9b08f3f6d4ac',
      amountTotal: 4500,
      currency: 'ILS',
      dueDate: '2026-04-10',
      title: 'Website maintenance',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('debt-123')
    }
  })
})
```

## User Interaction Tests

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('submits form with valid data', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()

  render(<CreateDebtForm onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('סכום'), '4500')
  await user.click(screen.getByRole('button', { name: 'צור חוב' }))

  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
    amountTotal: 4500,
  }))
})
```

## RTL Queries Priority (most to least preferred)
1. `getByRole` — semantic role (button, textbox, heading)
2. `getByLabelText` — form labels (important for RTL accessibility)
3. `getByText` — visible Hebrew text
4. `getByTestId` — last resort, use `data-testid`

## Mocking Patterns

```ts
// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/receivables',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock server actions in component tests
vi.mock('../api/actions', () => ({
  createDebt: vi.fn().mockResolvedValue({ success: true, data: { id: 'debt-1' } }),
}))
```

## Test Coverage Targets
- Components: test render, key interactions, Hebrew text content
- Hooks: test state transitions, edge cases
- Server actions: test validation errors, success path, auth failures
- Utils: 100% coverage (pure functions are easy to test)
- Skip testing: Next.js routing, Supabase SDK internals

## Hebrew Text in Tests
- Test for Hebrew strings as users see them: `getByText('באיחור')`
- Test RTL attribute: `expect(container.firstChild).toHaveAttribute('dir', 'rtl')`
- Currency format: `expect(element).toHaveTextContent('₪4,500')`
