---
name: payplus-integration
description: |
  PayPlus Israeli payment gateway integration for CashPulse. Use when creating payment
  links, processing payment webhooks, verifying signatures, handling payment status
  updates, or any PayPlus-related code. Trigger on: payplus, payment link, תשלום,
  payment webhook, payment gateway, charge, PayPlus.
---

# PayPlus Integration for CashPulse

## Overview
PayPlus is the Israeli payment gateway used for generating payment links attached to debts.
The flow: Create debt → Generate PayPlus payment link → Client pays via link → Webhook updates debt status.

## Environment Variables
```
PAYPLUS_API_KEY=...
PAYPLUS_SECRET_KEY=...        # For webhook signature verification
PAYPLUS_MERCHANT_UID=...
NEXT_PUBLIC_APP_URL=https://app.cashpulse.co.il
```

## Payment Link Creation (Server Action / Edge Function)

```ts
// src/lib/payplus/createPaymentLink.ts
interface CreateLinkParams {
  debtId: string
  companyId: string
  amount: number          // In ILS (e.g., 4500.00)
  currency: 'ILS'
  description: string     // Shown to payer
  clientEmail?: string
  expiresAt?: string      // ISO date
}

interface PayPlusLinkResult {
  paymentLinkUrl: string
  providerRef: string     // PayPlus internal reference ID
}

export async function createPayPlusPaymentLink(
  params: CreateLinkParams
): Promise<PayPlusLinkResult> {
  const response = await fetch('https://api.payplus.co.il/api/v1.0/PaymentPages/generateLink', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PAYPLUS_API_KEY}`,
    },
    body: JSON.stringify({
      payment_page_uid: process.env.PAYPLUS_MERCHANT_UID,
      charge_total: params.amount.toFixed(2),
      currency_code: 'ILS',
      more_info: params.description,
      more_info_1: params.debtId,     // Custom field for our reference
      more_info_2: params.companyId,
      email: params.clientEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
      expiry_date: params.expiresAt,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new IntegrationError('PayPlus', `Status ${response.status}: ${body}`)
  }

  const data = await response.json() as { data: { payment_page_link: string; page_request_uid: string } }

  return {
    paymentLinkUrl: data.data.payment_page_link,
    providerRef: data.data.page_request_uid,
  }
}
```

## Webhook Handler

```ts
// src/app/api/webhooks/payplus/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyPayPlusSignature } from '@/lib/payplus/verify'

export async function POST(request: NextRequest) {
  // 1. Read raw body
  const rawBody = await request.text()

  // 2. Verify signature
  const signature = request.headers.get('x-payplus-signature') ?? ''
  if (!verifyPayPlusSignature(rawBody, signature, process.env.PAYPLUS_SECRET_KEY!)) {
    console.error('[PayPlusWebhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse event
  let event: PayPlusWebhookEvent
  try {
    event = JSON.parse(rawBody) as PayPlusWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 4. Idempotency check
  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('provider_event_id', event.transaction_uid)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true, skipped: true })
  }

  // 5. Extract our debt reference
  const debtId = event.more_info_1  // We stored debtId here when creating link
  const companyId = event.more_info_2

  // 6. Validate amount
  const paidAmount = Number(event.transaction_amount)
  if (isNaN(paidAmount) || paidAmount <= 0) {
    console.error('[PayPlusWebhook] Invalid amount:', event.transaction_amount)
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  // 7. Store payment record (raw payload for audit)
  const { error: paymentError } = await supabase.from('payments').insert({
    company_id: companyId,
    debt_id: debtId,
    provider: 'payplus',
    provider_transaction_id: event.transaction_uid,
    provider_event_id: event.transaction_uid,
    amount: paidAmount,
    currency: 'ILS',
    status: event.status === 'APPROVED' ? 'succeeded' : 'failed',
    paid_at: event.status === 'APPROVED' ? new Date().toISOString() : null,
    failure_reason: event.status !== 'APPROVED' ? event.status : null,
    raw_payload: JSON.parse(rawBody),
  })

  if (paymentError) {
    console.error('[PayPlusWebhook] Failed to store payment:', paymentError)
    return NextResponse.json({ error: 'Storage error' }, { status: 500 })
  }

  // 8. Update debt status
  if (event.status === 'APPROVED') {
    await reconcileDebtPayment(supabase, debtId, paidAmount, companyId)
  }

  // 9. Log activity
  await supabase.from('activity_logs').insert({
    company_id: companyId,
    actor_type: 'system',
    entity_type: 'debt',
    entity_id: debtId,
    action: event.status === 'APPROVED' ? 'payment_received' : 'payment_failed',
    metadata: { amount: paidAmount, provider: 'payplus' },
  })

  return NextResponse.json({ received: true })
}
```

## Signature Verification

```ts
// src/lib/payplus/verify.ts
import { createHmac } from 'crypto'

export function verifyPayPlusSignature(
  rawBody: string,
  signature: string,
  secretKey: string
): boolean {
  const expected = createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('hex')

  // Use constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false

  let result = 0
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return result === 0
}
```

## Debt Reconciliation

```ts
// src/lib/payplus/reconcile.ts
import type { SupabaseClient } from '@supabase/supabase-js'

export async function reconcileDebtPayment(
  supabase: SupabaseClient,
  debtId: string,
  paidAmount: number,
  companyId: string
): Promise<void> {
  // Fetch current debt state
  const { data: debt } = await supabase
    .from('debts')
    .select('amount_total, amount_paid, amount_outstanding')
    .eq('id', debtId)
    .eq('company_id', companyId)  // Always scope by company
    .single()

  if (!debt) {
    console.error('[reconcileDebtPayment] Debt not found:', debtId)
    return
  }

  const newAmountPaid = Number(debt.amount_paid) + paidAmount
  const newAmountOutstanding = Number(debt.amount_total) - newAmountPaid
  const newStatus = newAmountOutstanding <= 0 ? 'paid' : 'partially_paid'

  await supabase
    .from('debts')
    .update({
      amount_paid: newAmountPaid,
      amount_outstanding: Math.max(0, newAmountOutstanding),
      status: newStatus,
      closed_at: newStatus === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', debtId)
    .eq('company_id', companyId)

  // Update client aggregate
  if (newStatus === 'paid') {
    const { data: client } = await supabase
      .from('clients')
      .select('company_id, total_debt_open, total_debt_paid')
      .eq('id', (await supabase.from('debts').select('client_id').eq('id', debtId).single()).data!.client_id)
      .single()

    if (client) {
      await supabase.from('clients').update({
        total_debt_open: Math.max(0, Number(client.total_debt_open) - Number(debt.amount_total)),
        total_debt_paid: Number(client.total_debt_paid) + Number(debt.amount_total),
      })
    }
  }
}
```

## PayPlus Webhook Event Types

```ts
// src/lib/payplus/types.ts
export interface PayPlusWebhookEvent {
  transaction_uid: string          // Unique event ID (use for idempotency)
  transaction_amount: string       // e.g. "4500.00"
  currency_code: string            // "ILS"
  status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING'
  more_info_1?: string             // Our debtId
  more_info_2?: string             // Our companyId
  payment_page_uid: string
  created_at: string
}
```

## Rules
- Never create payment links from client-side code — server/edge only
- Always store `raw_payload` for audit and replay
- Always check idempotency before processing any payment event
- Validate `company_id` scope even with service role — don't trust `more_info` fields blindly; cross-reference with DB
- Payment amount may be partial — always use reconciliation logic, not simple status flip
- Return 200 for all non-signature errors to prevent PayPlus from retrying unnecessarily
