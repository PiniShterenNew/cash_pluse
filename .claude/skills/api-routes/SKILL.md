---
name: api-routes
description: |
  API routes and Server Actions patterns for CashPulse. Use when writing route handlers,
  server actions, Zod validation, webhook endpoints, or deciding between server action
  vs API route. Trigger on: API, route handler, server action, webhook, endpoint, POST,
  GET, validation, zod, fetch.
---

# API Routes & Server Actions for CashPulse

## Decision: Server Action vs Route Handler

| Use case | Use |
|---|---|
| Form submissions, CRUD from Client Components | Server Action |
| Webhooks (PayPlus, WhatsApp) | Route Handler (`route.ts`) |
| External service integrations that need REST | Route Handler |
| Internal data mutations | Server Action |
| File uploads | Route Handler |

## Server Actions Pattern

```ts
// src/features/receivables/api/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/types/action.types'

// Zod schema — colocated with the action that uses it
const CreateDebtSchema = z.object({
  clientId: z.string().uuid(),
  amountTotal: z.number().positive().max(10_000_000),
  currency: z.literal('ILS'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  invoiceReference: z.string().max(100).optional(),
  title: z.string().min(1).max(200),
})

type CreateDebtInput = z.infer<typeof CreateDebtSchema>

export async function createDebt(
  input: CreateDebtInput
): Promise<ActionResult<{ id: string; paymentLinkUrl: string | null }>> {
  // 1. Validate input
  const parsed = CreateDebtSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'נתונים לא תקינים', details: parsed.error.flatten() }
  }

  // 2. Get authenticated user + company
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'לא מאומת' }
  }

  // 3. Get company_id from users table
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()
  if (!userData) return { success: false, error: 'חברה לא נמצאה' }

  // 4. Perform mutation
  const { data: debt, error: insertError } = await supabase
    .from('debts')
    .insert({
      company_id: userData.company_id,
      client_id: parsed.data.clientId,
      amount_total: parsed.data.amountTotal,
      amount_outstanding: parsed.data.amountTotal,
      amount_paid: 0,
      currency: parsed.data.currency,
      due_date: parsed.data.dueDate,
      invoice_reference: parsed.data.invoiceReference,
      title: parsed.data.title,
      status: 'open',
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[createDebt]', insertError)
    return { success: false, error: 'שגיאה ביצירת החוב' }
  }

  // 5. Revalidate affected pages
  revalidatePath('/receivables')
  revalidatePath('/dashboard')

  return { success: true, data: { id: debt.id, paymentLinkUrl: null } }
}
```

## Shared ActionResult Type

```ts
// src/lib/types/action.types.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }
```

## Calling Server Actions from Client Components

```ts
'use client'
import { useTransition } from 'react'
import { createDebt } from '../api/actions'

export function CreateDebtButton() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: CreateDebtInput) {
    startTransition(async () => {
      const result = await createDebt(formData)
      if (result.success) {
        toast.success('חוב נוצר בהצלחה')
        // router.push or close modal
      } else {
        toast.error(result.error)
      }
    })
  }

  return <button disabled={isPending}>...</button>
}
```

## Route Handlers (Webhooks)

```ts
// src/app/api/webhooks/payplus/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyPayPlusSignature } from '@/lib/payplus/verify'

export async function POST(request: NextRequest) {
  // 1. Read raw body for signature verification
  const rawBody = await request.text()
  const signature = request.headers.get('x-payplus-signature') ?? ''

  // 2. Verify signature
  if (!verifyPayPlusSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse payload
  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 4. Process with service role (bypasses RLS — must scope by company_id in code)
  const supabase = createServiceClient()
  // ... idempotent event processing

  // 5. Always return 200 quickly (process async if needed)
  return NextResponse.json({ received: true }, { status: 200 })
}
```

## Route Handler for External Data (when needed)

```ts
// src/app/api/v1/debts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? '20'), 100)

  // ... query with RLS automatically applied
  const { data, count } = await supabase
    .from('debts')
    .select('*', { count: 'exact' })
    .eq('status', status ?? 'open')
    .range((page - 1) * pageSize, page * pageSize - 1)

  return NextResponse.json({ items: data, page, pageSize, total: count })
}
```

## Error Response Standard

```ts
// All API routes return this shape on error:
{
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTEGRATION_ERROR" | "RATE_LIMITED" | "INTERNAL_ERROR",
    "message": "Human readable Hebrew message",
    "details": {}  // optional
  }
}
```

## Zod Schema Conventions
- Define schemas in the same file as the action/route that uses them
- Reuse shared schemas from `src/lib/schemas/` only if used in 3+ places
- Always use `.safeParse()` — never throw on validation errors in server actions
- Export the inferred type alongside the schema: `export type CreateDebtInput = z.infer<typeof CreateDebtSchema>`

## Security Rules
- NEVER trust `company_id` from client input — always derive from authenticated user
- ALWAYS validate webhook signatures before processing
- Rate limit public endpoints via middleware
- Use service client only in webhook handlers — never expose service key to browser
