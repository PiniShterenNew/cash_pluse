---
name: ai-predictions
description: |
  AI prediction engine for CashPulse — client reliability scoring, expected payment date
  calculation, confidence levels, and prediction snapshots. Use when implementing the
  prediction service, computing scores, storing snapshots, or displaying AI-generated
  forecasts. Trigger on: prediction, reliability score, expected payment, confidence,
  forecast, scoring, ציון אמינות, תחזית תשלום, AI model.
---

# AI Predictions for CashPulse

## Overview
Two prediction outputs per client+debt:
1. **Reliability Score** (0–100) — How trustworthy is this client's payment behavior
2. **Expected Payment Date** — When will this specific debt likely be paid

Both are stored in `prediction_snapshots` and denormalized to `debts.expected_payment_date`,
`debts.expected_payment_confidence`, and `clients.reliability_score` for fast reads.

## Reliability Score Formula

```ts
// src/lib/predictions/reliabilityScore.ts

interface ClientPaymentHistory {
  totalDebts: number
  paidOnTime: number           // Paid before or on due_date
  paidLate: number             // Paid after due_date
  unpaid: number               // Canceled or disputed
  avgDelayDays: number         // Average days late on paid debts
  lastPaymentDaysAgo: number   // Days since most recent payment
}

/**
 * Score breakdown:
 * - Base score: 50
 * - On-time rate: ±30 points (0% = -30, 100% = +30)
 * - Average delay penalty: up to -20 points
 * - Recent activity bonus: up to +10 points
 * - Unpaid/disputed penalty: -5 per instance (min 0)
 */
export function computeReliabilityScore(history: ClientPaymentHistory): number {
  if (history.totalDebts === 0) return 50  // Default for new clients

  const paidDebts = history.paidOnTime + history.paidLate
  if (paidDebts === 0) return Math.max(0, 50 - history.unpaid * 10)

  // On-time rate component (±30 from base)
  const onTimeRate = history.paidOnTime / paidDebts
  const onTimePoints = (onTimeRate - 0.5) * 60  // Range: -30 to +30

  // Delay penalty (0 to -20 points)
  const delayPenalty = Math.min(20, history.avgDelayDays * 0.8)

  // Recent activity bonus (paying recently = +10)
  const recencyBonus = history.lastPaymentDaysAgo < 90
    ? Math.max(0, 10 - history.lastPaymentDaysAgo / 9)
    : 0

  // Unpaid penalty
  const unpaidPenalty = history.unpaid * 5

  const raw = 50 + onTimePoints - delayPenalty + recencyBonus - unpaidPenalty
  return Math.round(Math.min(100, Math.max(0, raw)))
}

// Score to label mapping
export function getScoreLabel(score: number): {
  label: string
  color: 'mint' | 'honey' | 'rose'
} {
  if (score >= 75) return { label: 'אמין', color: 'mint' }
  if (score >= 50) return { label: 'בינוני', color: 'honey' }
  return { label: 'סיכון גבוה', color: 'rose' }
}
```

## Expected Payment Date Formula

```ts
// src/lib/predictions/expectedPaymentDate.ts

interface DebtPredictionInput {
  dueDate: string               // ISO date
  overdueDays: number
  clientAvgDelayDays: number    // From payment history
  lastReminderSentDaysAgo: number | null
  reminderCount: number         // How many reminders sent for this debt
  amountOutstanding: number
  clientReliabilityScore: number
}

interface PredictionResult {
  expectedDate: string          // ISO date
  confidence: 'low' | 'medium' | 'high'
  explanation: string[]         // Hebrew factors list for display
}

export function predictPaymentDate(input: DebtPredictionInput): PredictionResult {
  const today = new Date()
  const explanation: string[] = []

  // Base: due date + client's typical delay
  let estimatedDaysFromNow = Math.max(0, input.clientAvgDelayDays - input.overdueDays)

  if (input.clientAvgDelayDays > 0) {
    explanation.push(`ממוצע איחור היסטורי: ${input.clientAvgDelayDays} ימים`)
  }

  // Reminder effect: recent reminder → pays faster
  if (input.lastReminderSentDaysAgo !== null && input.lastReminderSentDaysAgo <= 3) {
    estimatedDaysFromNow = Math.max(1, estimatedDaysFromNow - 3)
    explanation.push(`תזכורת נשלחה לפני ${input.lastReminderSentDaysAgo} ימים`)
  }

  // High amount → may take longer
  if (input.amountOutstanding > 50_000) {
    estimatedDaysFromNow += 5
    explanation.push('סכום גבוה — עלול לדרוש אישור נוסף')
  }

  // Low reliability → add buffer
  if (input.clientReliabilityScore < 40) {
    estimatedDaysFromNow += 7
    explanation.push('ציון אמינות נמוך')
  }

  const expectedDate = new Date(today)
  expectedDate.setDate(expectedDate.getDate() + estimatedDaysFromNow)

  // Confidence based on data quality
  const confidence = computeConfidence(input)

  return {
    expectedDate: expectedDate.toISOString().split('T')[0],
    confidence,
    explanation,
  }
}

function computeConfidence(input: DebtPredictionInput): 'low' | 'medium' | 'high' {
  // Need at least 3 historical payments for medium confidence
  // Score consistency and recency matter
  if (input.clientReliabilityScore >= 70 && input.reminderCount >= 1) return 'high'
  if (input.clientReliabilityScore >= 40) return 'medium'
  return 'low'
}
```

## Prediction Service — Edge Function

```ts
// supabase/functions/recompute-predictions/index.ts
import { createClient } from '@supabase/supabase-js'
import { computeReliabilityScore } from '../_shared/reliabilityScore.ts'
import { predictPaymentDate } from '../_shared/expectedPaymentDate.ts'

const MODEL_VERSION = 'pred-v1'

Deno.serve(async (req) => {
  // Accepts: { companyId?: string, debtId?: string } for targeted recompute
  // Called: after payment webhook, nightly cron, after reminder sent

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { companyId } = await req.json() as { companyId?: string }

  // Fetch all open debts (scoped to company if provided)
  const query = supabase
    .from('debts')
    .select(`
      id, company_id, client_id, amount_outstanding, due_date,
      overdue_days, last_reminder_sent_at,
      clients ( id, reliability_score )
    `)
    .not('status', 'in', '("paid","canceled","disputed")')

  if (companyId) query.eq('company_id', companyId)

  const { data: debts } = await query

  for (const debt of debts ?? []) {
    // 1. Get client payment history
    const history = await getClientPaymentHistory(supabase, debt.client_id, debt.company_id)

    // 2. Compute reliability score
    const reliabilityScore = computeReliabilityScore(history)

    // 3. Compute expected payment date
    const lastReminderSentDaysAgo = debt.last_reminder_sent_at
      ? Math.floor((Date.now() - new Date(debt.last_reminder_sent_at).getTime()) / 86_400_000)
      : null

    const prediction = predictPaymentDate({
      dueDate: debt.due_date,
      overdueDays: debt.overdue_days,
      clientAvgDelayDays: history.avgDelayDays,
      lastReminderSentDaysAgo,
      reminderCount: history.totalDebts,
      amountOutstanding: debt.amount_outstanding,
      clientReliabilityScore: reliabilityScore,
    })

    // 4. Store snapshot
    await supabase.from('prediction_snapshots').insert({
      company_id: debt.company_id,
      subject_type: 'debt',
      subject_id: debt.id,
      model_version: MODEL_VERSION,
      expected_payment_date: prediction.expectedDate,
      reliability_score: reliabilityScore,
      confidence_score: confidenceToNumber(prediction.confidence),
      explanation: { factors: prediction.explanation },
    })

    // 5. Denormalize to debt row (for fast reads)
    await supabase.from('debts').update({
      expected_payment_date: prediction.expectedDate,
      expected_payment_confidence: prediction.confidence,
    }).eq('id', debt.id)

    // 6. Update client reliability score
    await supabase.from('clients').update({
      reliability_score: reliabilityScore,
    }).eq('id', debt.client_id).eq('company_id', debt.company_id)
  }

  return new Response(JSON.stringify({ processed: debts?.length ?? 0 }))
})

function confidenceToNumber(c: 'low' | 'medium' | 'high'): number {
  return { low: 0.33, medium: 0.66, high: 0.92 }[c]
}
```

## Displaying Predictions in UI

```tsx
// Confidence indicator component
export function ConfidenceBadge({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  const config = {
    high:   { label: 'ביטחון גבוה', dots: 3, color: 'text-mint-600' },
    medium: { label: 'ביטחון בינוני', dots: 2, color: 'text-honey-600' },
    low:    { label: 'ביטחון נמוך', dots: 1, color: 'text-sand-400' },
  }[confidence]

  return (
    <span className={`flex items-center gap-1 text-xs ${config.color}`}
          title={config.label}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${
          i < config.dots ? 'bg-current' : 'bg-sand-200'
        }`} />
      ))}
    </span>
  )
}

// Prediction explanation (expandable)
export function PredictionExplanation({
  expectedDate, confidence, factors, aiExplanation
}: {
  expectedDate: string
  confidence: 'low' | 'medium' | 'high'
  factors: string[]
  aiExplanation?: string
}) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-ink-500 hover:text-ink-800">
        למה {formatDate(expectedDate)}?
      </summary>
      <ul className="mt-2 space-y-1 ps-4 text-ink-400">
        {factors.map((f, i) => <li key={i}>• {f}</li>)}
      </ul>
      {aiExplanation && (
        <p className="mt-2 text-xs text-lavender-600 italic">{aiExplanation}</p>
      )}
    </details>
  )
}
```

## Trigger Points
- After `payments.INSERT` with status `succeeded` → recompute for that debt's client
- After `debts` becomes overdue (daily cron at 06:00 Israel time)
- After `reminders.INSERT` (reminder sent → recalculate expected date)
- Manual: `POST /api/v1/internal/predictions/recompute` (service role only)
