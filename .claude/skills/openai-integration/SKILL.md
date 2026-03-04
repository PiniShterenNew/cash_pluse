---
name: openai-integration
description: |
  OpenAI API integration for CashPulse — Hebrew reminder drafts, prediction explanations,
  streaming responses, server-only calls, prompt engineering, and fallback handling.
  Use when generating AI content, calling OpenAI, writing prompts, or streaming text.
  Trigger on: openai, gpt, ai, prompt, completion, streaming, generate, draft, reminder text,
  explanation, model, token.
---

# OpenAI Integration for CashPulse

## Architecture Rules
- **NEVER** call OpenAI from the browser — server/Edge only
- All calls go through Server Actions or Supabase Edge Functions
- Always provide fallback if OpenAI fails — CashPulse works without AI
- Store model version alongside generated content for reproducibility
- Hebrew prompts get Hebrew responses — always specify language explicitly

## Client Setup

```ts
// src/lib/openai/client.ts
import OpenAI from 'openai'

// Singleton — instantiated once at module level (server-side only)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Timeout after 10s — financial app users won't wait longer
  timeout: 10_000,
  maxRetries: 2,
})

export const MODELS = {
  fast: 'gpt-4o-mini',     // Reminder drafts, short completions
  smart: 'gpt-4o',         // Prediction explanations, complex reasoning
} as const
```

## Use Case 1: WhatsApp Reminder Draft Generation

```ts
// src/features/whatsapp/api/generateReminderDraft.ts
'use server'

import { openai, MODELS } from '@/lib/openai/client'
import type { ActionResult } from '@/lib/types/action.types'

interface ReminderContext {
  clientName: string
  amountOutstanding: number
  currency: 'ILS'
  overdueDays: number
  dueDate: string           // ISO date
  tone: 'gentle' | 'business' | 'firm'
  businessName: string
  paymentLinkUrl?: string
}

const TONE_INSTRUCTIONS = {
  gentle: 'ידידותי, חם, מבין. כאילו חבר שמזכיר בעדינות.',
  business: 'מקצועי, ענייני, נעים. סגנון עסקי ישראלי.',
  firm: 'נחוש, ברור, לא מתנצל. אבל עדיין מנומס.',
} as const

export async function generateReminderDraft(
  ctx: ReminderContext
): Promise<ActionResult<{ text: string; modelVersion: string }>> {
  const prompt = buildReminderPrompt(ctx)

  try {
    const completion = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [
        {
          role: 'system',
          content: `אתה עוזר לעסקים ישראליים לנסח הודעות גבייה ב-WhatsApp.
הכתיבה בעברית תקנית, קצרה (עד 3 משפטים), ומתאימה לנייד.
${TONE_INSTRUCTIONS[ctx.tone]}
אל תכלול שאלות. סיים עם CTA ברור.`,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content?.trim()
    if (!text) throw new Error('Empty response from OpenAI')

    return {
      success: true,
      data: {
        text,
        modelVersion: `${MODELS.fast}:${completion.id}`,
      },
    }
  } catch (err) {
    console.error('[generateReminderDraft] OpenAI error:', err)
    // Return fallback template — never block the user
    return {
      success: true,
      data: {
        text: getFallbackTemplate(ctx),
        modelVersion: 'fallback-v1',
      },
    }
  }
}

function buildReminderPrompt(ctx: ReminderContext): string {
  const amount = `₪${ctx.amountOutstanding.toLocaleString('he-IL')}`
  const overdue = ctx.overdueDays > 0
    ? `(${ctx.overdueDays} ימי איחור)`
    : '(לא באיחור עדיין)'

  return `
נסח הודעת WhatsApp לגבייה:
- שם לקוח: ${ctx.clientName}
- סכום לתשלום: ${amount} ${overdue}
- שם העסק: ${ctx.businessName}
${ctx.paymentLinkUrl ? `- קישור לתשלום: ${ctx.paymentLinkUrl}` : '- אין קישור לתשלום עדיין'}
`.trim()
}

function getFallbackTemplate(ctx: ReminderContext): string {
  const amount = `₪${ctx.amountOutstanding.toLocaleString('he-IL')}`
  return `שלום ${ctx.clientName}, תזכורת ידידותית לגבי חוב בסך ${amount} ל-${ctx.businessName}.${
    ctx.paymentLinkUrl ? ` לתשלום נוח: ${ctx.paymentLinkUrl}` : ''
  } תודה!`
}
```

## Use Case 2: Streaming Reminder Draft (for live typing effect)

```ts
// src/app/api/ai/reminder-draft/route.ts
import { NextRequest } from 'next/server'
import { openai, MODELS } from '@/lib/openai/client'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await request.json() as ReminderContext

  const stream = await openai.chat.completions.create({
    model: MODELS.fast,
    messages: [
      { role: 'system', content: 'נסח הודעת WhatsApp לגבייה בעברית. עד 3 משפטים.' },
      { role: 'user', content: buildReminderPrompt(body) },
    ],
    stream: true,
    max_tokens: 150,
  })

  // Stream response as Server-Sent Events
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
```

```tsx
// Client-side streaming hook
'use client'
export function useReminderStream() {
  const [text, setText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  async function generate(ctx: ReminderContext) {
    setText('')
    setIsStreaming(true)
    try {
      const response = await fetch('/api/ai/reminder-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const { text: chunk } = JSON.parse(line.slice(6)) as { text: string }
            setText((prev) => prev + chunk)
          }
        }
      }
    } finally {
      setIsStreaming(false)
    }
  }

  return { text, isStreaming, generate }
}
```

## Use Case 3: Prediction Explanation (Edge Function)

```ts
// supabase/functions/explain-prediction/index.ts
import { openai, MODELS } from '../_shared/openai.ts'

interface PredictionExplainInput {
  clientName: string
  expectedPaymentDate: string
  confidence: 'low' | 'medium' | 'high'
  factors: string[]          // e.g. ["ממוצע איחור: 6 ימים", "תזכורת נשלחה לפני 2 ימים"]
}

export async function explainPrediction(input: PredictionExplainInput): Promise<string> {
  const factorsText = input.factors.map((f) => `• ${f}`).join('\n')

  try {
    const completion = await openai.chat.completions.create({
      model: MODELS.smart,
      messages: [
        {
          role: 'system',
          content: 'אתה מסביר תחזיות תשלום לבעלי עסקים ישראלים. הסבר קצר, בגוף שני, ידידותי.',
        },
        {
          role: 'user',
          content: `
הסבר בשני משפטים למה אנחנו צופים שהלקוח ${input.clientName} ישלם בתאריך ${input.expectedPaymentDate}:
${factorsText}
רמת ביטחון: ${input.confidence === 'high' ? 'גבוהה' : input.confidence === 'medium' ? 'בינונית' : 'נמוכה'}
          `.trim(),
        },
      ],
      max_tokens: 80,
      temperature: 0.4,  // Low temp = consistent explanations
    })

    return completion.choices[0]?.message?.content?.trim()
      ?? 'התחזית מבוססת על היסטוריית התשלומים של הלקוח.'
  } catch {
    return 'התחזית מבוססת על היסטוריית התשלומים של הלקוח.'  // Graceful fallback
  }
}
```

## Cost & Rate Limiting

```ts
// src/lib/openai/rateLimit.ts
// Simple token bucket — prevent runaway costs

const LIMITS = {
  reminder_draft: { maxPerHour: 100, maxPerUser: 20 },
  prediction_explain: { maxPerHour: 500, maxPerCompany: 50 },
} as const

// Track usage in Supabase (ai_usage table) or Redis
// Before calling OpenAI, check limit:
export async function checkRateLimit(
  companyId: string,
  operation: keyof typeof LIMITS
): Promise<boolean> {
  // Query recent usage count in last hour
  // Return true if under limit
}
```

## Prompt Engineering Rules
- Always write system prompt in Hebrew to get Hebrew output
- Specify output length constraints (`עד 3 משפטים`, `max_tokens: 150`)
- Use low temperature (0.3–0.5) for explanations, higher (0.7) for creative drafts
- Always include business context (company name, client name) — no generic outputs
- Add `// לדוגמה:` examples in system prompt when format matters

## Fallback Hierarchy
1. Try OpenAI → success → use result
2. OpenAI timeout/error → use hardcoded Hebrew template
3. Never show error to user for AI failures — fallback silently
4. Log all failures with context for monitoring
