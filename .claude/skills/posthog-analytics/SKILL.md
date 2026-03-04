---
name: posthog-analytics
description: |
  PostHog analytics integration for CashPulse. Use when tracking user events, page views,
  feature flags, user identification, or any analytics instrumentation. Trigger on:
  posthog, analytics, track, event, identify, feature flag, funnel, session recording.
---

# PostHog Analytics for CashPulse

## Setup

```ts
// src/lib/posthog/client.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV !== 'production') return  // Only in production

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: false,      // We capture manually via hook
    capture_pageleave: true,
    autocapture: false,           // Manual tracking for control
    session_recording: {
      maskAllInputs: true,        // Privacy — mask form inputs
    },
  })
}
```

```tsx
// src/app/layout.tsx — Initialize once at root
import { PHProvider } from '@/lib/posthog/provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html dir="rtl" lang="he">
      <body>
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  )
}
```

```tsx
// src/lib/posthog/provider.tsx
'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { initPostHog } from './client'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { initPostHog() }, [])

  // Track page views manually
  const pathname = usePathname()
  const searchParams = useSearchParams()
  useEffect(() => {
    posthog.capture('$pageview')
  }, [pathname, searchParams])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

## User Identification (on login)

```ts
// src/features/auth/api/actions.ts — after successful login
import posthog from 'posthog-js'

export async function identifyUser(userId: string, companyId: string, plan: 'basic' | 'pro') {
  posthog.identify(userId, {
    company_id: companyId,
    plan,
    app_locale: 'he',
  })
  posthog.group('company', companyId, { plan })
}

// On logout
export function resetAnalytics() {
  posthog.reset()
}
```

## Event Tracking — Canonical Events

All events follow snake_case naming. Use these exact event names for consistency:

```ts
// src/lib/posthog/events.ts
export const EVENTS = {
  // Debts / Receivables
  DEBT_CREATED: 'debt_created',
  DEBT_STATUS_CHANGED: 'debt_status_changed',
  DEBT_DELETED: 'debt_deleted',

  // Reminders
  REMINDER_SENT: 'reminder_sent',
  REMINDER_BULK_SENT: 'reminder_bulk_sent',
  REMINDER_TEMPLATE_SELECTED: 'reminder_template_selected',

  // Clients
  CLIENT_CREATED: 'client_created',
  CLIENT_PROFILE_VIEWED: 'client_profile_viewed',

  // Payments
  PAYMENT_LINK_CREATED: 'payment_link_created',
  PAYMENT_RECEIVED: 'payment_received',         // server-side event

  // Navigation / UX
  FILTER_APPLIED: 'filter_applied',
  BULK_ACTION_TRIGGERED: 'bulk_action_triggered',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  WHATSAPP_CONNECTED: 'whatsapp_connected',

  // Settings
  PLAN_UPGRADED: 'plan_upgraded',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]
```

## Tracking Function (typed wrapper)

```ts
// src/lib/posthog/track.ts
import posthog from 'posthog-js'
import type { EventName } from './events'

interface EventProperties {
  debt_created: { amount: number; currency: 'ILS'; client_id: string }
  debt_status_changed: { debt_id: string; from_status: string; to_status: string }
  reminder_sent: { debt_id: string; template_key: string; channel: 'whatsapp' }
  reminder_bulk_sent: { count: number; template_key: string }
  payment_link_created: { debt_id: string; amount: number }
  filter_applied: { filter_type: string; value: string }
  [key: string]: Record<string, unknown>
}

export function track<E extends EventName>(
  event: E,
  properties?: EventProperties[E]
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[Analytics]', event, properties)
    return
  }
  posthog.capture(event, properties)
}
```

## Usage in Components / Actions

```ts
// In a Server Action (server-side tracking via PostHog Node)
import { PostHog } from 'posthog-node'

const serverPostHog = new PostHog(process.env.POSTHOG_KEY!, {
  host: process.env.POSTHOG_HOST,
})

// Server-side event (e.g., after payment webhook)
serverPostHog.capture({
  distinctId: userId,
  event: EVENTS.PAYMENT_RECEIVED,
  properties: { debt_id: debtId, amount: paidAmount, currency: 'ILS' },
})
await serverPostHog.shutdown()
```

```tsx
// In a Client Component
import { track, EVENTS } from '@/lib/posthog/track'

function CreateDebtButton() {
  function handleSuccess(debtId: string, amount: number) {
    track(EVENTS.DEBT_CREATED, {
      amount,
      currency: 'ILS',
      client_id: clientId,
    })
  }
}
```

## Feature Flags

```ts
// src/lib/posthog/flags.ts
import { useFeatureFlagEnabled } from 'posthog-js/react'

// Available flags
export const FLAGS = {
  PRO_REPORTS: 'pro_reports',
  AI_PREDICTIONS: 'ai_predictions',
  CSV_IMPORT: 'csv_import',
} as const

// Usage in component
export function ReportsSection() {
  const isProEnabled = useFeatureFlagEnabled(FLAGS.PRO_REPORTS)

  if (!isProEnabled) {
    return <ProUpgradePrompt />
  }

  return <FullReportsView />
}
```

## Privacy Rules
- Always `maskAllInputs: true` in session recording
- Never track PII (phone numbers, email, business names) in event properties
- Use `company_id` and `debt_id` (UUIDs) — never actual amounts in group-level props
- Amounts are OK in event properties (for funnel analysis) but not in user properties
