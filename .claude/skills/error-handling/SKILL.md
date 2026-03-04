---
name: error-handling
description: |
  Error handling patterns for CashPulse — typed errors, error boundaries, toast
  notifications, async error flows, and never-silent-fail principle. Use when handling
  try/catch, error boundaries, failed API calls, server errors, or user-facing error
  messages. Trigger on: error, catch, try, boundary, toast, failed, exception, throw.
---

# Error Handling for CashPulse

## Core Principle
**Never silently fail.** Every error must either:
1. Show the user a clear, actionable Hebrew message, OR
2. Be logged for debugging (with context), AND
3. Recover gracefully (not crash the app)

## Typed Error Result (canonical)

```ts
// src/lib/types/action.types.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

// Usage — always exhaustive:
const result = await createDebt(input)
if (!result.success) {
  toast.error(result.error) // never ignore this branch
  return
}
// TypeScript now knows result.data exists
doSomething(result.data)
```

## Server Action Error Pattern

```ts
'use server'

export async function updateDebtStatus(
  debtId: string,
  status: DebtStatus
): Promise<ActionResult<{ updatedAt: string }>> {
  try {
    const supabase = await createServerClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'לא מאומת' }
    }

    // Business logic validation
    if (status === 'paid' && !TERMINAL_STATUSES.includes(status)) {
      return { success: false, error: 'מעבר סטטוס לא חוקי' }
    }

    const { data, error } = await supabase
      .from('debts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', debtId)
      .select('updated_at')
      .single()

    if (error) {
      // Log technical details, return Hebrew message to user
      console.error('[updateDebtStatus] Supabase error:', {
        debtId,
        status,
        code: error.code,
        message: error.message,
      })
      return { success: false, error: 'שגיאה בעדכון הסטטוס' }
    }

    return { success: true, data: { updatedAt: data.updated_at } }
  } catch (err) {
    console.error('[updateDebtStatus] Unexpected error:', err)
    return { success: false, error: 'שגיאה לא צפויה' }
  }
}
```

## Error Boundary (Next.js App Router)

```tsx
// src/app/(dashboard)/receivables/error.tsx
'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ReceivablesError({ error, reset }: Props) {
  useEffect(() => {
    // Log to PostHog or console in production
    console.error('[ReceivablesError]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50">
        <AlertCircle className="h-8 w-8 text-danger-500" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-ink-900">משהו השתבש</h2>
        <p className="mt-1 text-sm text-ink-500">לא הצלחנו לטעון את הרשימה. אנחנו על זה.</p>
      </div>
      <button onClick={reset} className="btn-secondary text-sm">
        נסה שוב
      </button>
    </div>
  )
}
```

## Toast Notifications Pattern

```ts
// Use a toast library (e.g. sonner, react-hot-toast)
// Conventions:
import { toast } from 'sonner'

// Success
toast.success('החוב נוצר בהצלחה')
toast.success('תזכורת נשלחה', { description: 'יוסי לוי · 05:45' })

// Error — always actionable
toast.error('שגיאה בשליחת התזכורת', {
  description: 'בדוק את חיבור ה-WhatsApp',
  action: { label: 'הגדרות', onClick: () => router.push('/settings') },
})

// Loading → success pattern
const toastId = toast.loading('שולח תזכורת...')
// ... after action:
toast.dismiss(toastId)
toast.success('נשלח!')
```

## Async Error in Client Component

```tsx
'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function SendReminderButton({ debtId }: { debtId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleSend() {
    startTransition(async () => {
      const toastId = toast.loading('שולח תזכורת...')
      try {
        const result = await sendReminder(debtId)
        toast.dismiss(toastId)

        if (result.success) {
          toast.success('תזכורת נשלחה ✓')
        } else {
          toast.error(result.error)
        }
      } catch {
        toast.dismiss(toastId)
        toast.error('שגיאה לא צפויה — נסה שוב')
      }
    })
  }

  return (
    <button onClick={handleSend} disabled={isPending}>
      {isPending ? 'שולח...' : 'שלח תזכורת'}
    </button>
  )
}
```

## Integration / Webhook Error Handling

```ts
// Edge Function or Route Handler for webhooks
// Pattern: always acknowledge receipt (200), process errors internally

export async function POST(request: NextRequest) {
  try {
    const payload = await validateAndParseWebhook(request)

    // Check idempotency first
    const alreadyProcessed = await checkIdempotency(payload.eventId)
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, skipped: true })
    }

    await processPaymentEvent(payload)
    return NextResponse.json({ received: true })
  } catch (err) {
    // Log to monitoring — but still return 200 to prevent retries for non-recoverable errors
    console.error('[PayPlusWebhook] Processing error:', err)

    if (err instanceof SignatureError) {
      // Retrying won't help — return 401
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // For transient errors, return 500 so PayPlus retries
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }
}
```

## Typed Error Classes

```ts
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string  // Hebrew
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class SignatureError extends AppError {
  constructor() {
    super('Webhook signature verification failed', 'SIGNATURE_ERROR', 'חתימה לא תקינה')
  }
}

export class IntegrationError extends AppError {
  constructor(service: string, detail: string) {
    super(`${service} integration error: ${detail}`, 'INTEGRATION_ERROR', `שגיאה בחיבור ל-${service}`)
  }
}
```

## Logging Convention

```ts
// Always include context — never bare console.error('something failed')
console.error('[ComponentName/functionName] Description:', {
  context: { debtId, userId, status },
  error: err instanceof Error ? err.message : err,
})
```

## Rules
- Never `catch` and do nothing — at minimum log
- Never expose technical error messages (DB errors, stack traces) to UI
- Hebrew messages to users, English in logs
- For async server actions: always wrap in try/catch returning ActionResult
- For webhooks: always return 200 for non-signature errors (let provider retry)
- Failed WhatsApp/PayPlus calls must update the relevant record status to 'failed'
