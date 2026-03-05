---
name: csv-import
description: |
  CSV import feature for CashPulse — parsing Hebrew CSV files, validating rows, bulk
  inserting clients and debts, idempotency, progress reporting, and error summaries.
  Use when building the import feature, handling file uploads, parsing CSV/Excel, or
  bulk data operations. Trigger on: csv, import, xlsx, upload, bulk, ייבוא, קובץ.
---

# CSV Import for CashPulse

## Supported Import Types
1. **Clients** — bulk import client list
2. **Debts** — bulk import open receivables (with optional client lookup)
3. **Transactions** — bulk import income/expense history

## File Handling Flow

```
User uploads CSV → Parse in browser (Papa Parse) →
Preview + validation → User confirms →
Server Action processes in batches → Progress reported →
Summary shown (success / warnings / errors)
```

## Client-Side Parsing

```tsx
// src/features/settings/components/CsvImportUploader.tsx
'use client'
import Papa from 'papaparse'
import { useState } from 'react'

interface ParsedRow {
  rowIndex: number
  raw: Record<string, string>
  parsed?: ClientImportRow | DebtImportRow
  errors: string[]
}

export function CsvImportUploader({ type }: { type: 'clients' | 'debts' }) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string>()

  function handleFile(file: File) {
    setFileName(file.name)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',   // Hebrew support
      complete: (results) => {
        const parsed = results.data.map((raw, i) =>
          validateRow(raw, i + 2, type)  // +2 for header row + 1-based
        )
        setRows(parsed)
      },
      error: (err) => {
        toast.error(`שגיאה בקריאת הקובץ: ${err.message}`)
      },
    })
  }

  return (
    <div>
      <FileDropzone onFile={handleFile} accept=".csv,.xlsx" />
      {rows.length > 0 && (
        <ImportPreview rows={rows} type={type} fileName={fileName!} />
      )}
    </div>
  )
}
```

## Validation Schemas

```ts
// src/features/settings/utils/csvValidation.ts
import { z } from 'zod'

// Expected CSV columns for clients import
export const ClientCsvRowSchema = z.object({
  // Flexible column names — support Hebrew and English headers
  name: z.string().min(1, 'שם חובה'),
  contact_name: z.string().optional(),
  // Phone: accept Israeli formats, normalize to E.164
  phone: z.string()
    .regex(/^(\+972|0)[1-9]\d{7,8}$/, 'מספר טלפון לא תקין')
    .transform(normalizeIsraeliPhone),
  email: z.string().email('אימייל לא תקין').optional().or(z.literal('')),
})

export type ClientCsvRow = z.infer<typeof ClientCsvRowSchema>

export const DebtCsvRowSchema = z.object({
  client_name: z.string().min(1, 'שם לקוח חובה'),
  amount: z.string()
    .transform((v) => parseFloat(v.replace(/[₪,\s]/g, '')))
    .refine((n) => n > 0, 'סכום חייב להיות חיובי'),
  due_date: z.string()
    .transform(parseIsraeliDate)   // Accepts DD/MM/YYYY and ISO
    .refine((d) => !isNaN(Date.parse(d)), 'תאריך לא תקין'),
  invoice_reference: z.string().optional(),
  description: z.string().optional(),
})

export type DebtCsvRow = z.infer<typeof DebtCsvRowSchema>

// Normalize column names — headers may be in Hebrew or English
const COLUMN_ALIASES: Record<string, string> = {
  'שם':           'name',
  'שם לקוח':     'name',
  'Name':         'name',
  'טלפון':       'phone',
  'Phone':        'phone',
  'נייד':        'phone',
  'אימייל':      'email',
  'Email':        'email',
  'סכום':        'amount',
  'Amount':       'amount',
  'תאריך פירעון': 'due_date',
  'Due Date':     'due_date',
  'מספר חשבונית': 'invoice_reference',
}

export function normalizeHeaders(raw: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      COLUMN_ALIASES[key.trim()] ?? key.trim().toLowerCase(),
      value.trim(),
    ])
  )
}

function normalizeIsraeliPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('972')) return `+${digits}`
  if (digits.startsWith('0')) return `+972${digits.slice(1)}`
  return `+972${digits}`
}

function parseIsraeliDate(input: string): string {
  // Handle DD/MM/YYYY → ISO
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = input.match(ddmmyyyy)
  if (match) {
    const [, d, m, y] = match
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return input  // Assume already ISO
}
```

## Row Validation

```ts
// src/features/settings/utils/csvValidation.ts

interface ParsedRow {
  rowIndex: number
  raw: Record<string, string>
  parsed?: ClientCsvRow
  errors: string[]
}

export function validateRow(
  raw: Record<string, string>,
  rowIndex: number,
  type: 'clients' | 'debts'
): ParsedRow {
  const normalized = normalizeHeaders(raw)
  const schema = type === 'clients' ? ClientCsvRowSchema : DebtCsvRowSchema
  const result = schema.safeParse(normalized)

  if (result.success) {
    return { rowIndex, raw, parsed: result.data as ClientCsvRow, errors: [] }
  }

  const errors = result.error.errors.map(
    (e) => `${e.path.join('.')}: ${e.message}`
  )
  return { rowIndex, raw, errors }
}
```

## Import Preview UI

```tsx
// src/features/settings/components/ImportPreview.tsx
export function ImportPreview({ rows, type, fileName }: ImportPreviewProps) {
  const validRows = rows.filter((r) => r.errors.length === 0)
  const errorRows = rows.filter((r) => r.errors.length > 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex gap-3">
        <span className="rounded-full bg-mint-50 px-3 py-1 text-sm text-mint-700">
          ✓ {validRows.length} שורות תקינות
        </span>
        {errorRows.length > 0 && (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-700">
            ✗ {errorRows.length} שגיאות
          </span>
        )}
      </div>

      {/* Error table */}
      {errorRows.length > 0 && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="mb-2 text-sm font-medium text-rose-700">שורות עם שגיאות:</p>
          {errorRows.map((row) => (
            <div key={row.rowIndex} className="text-xs text-rose-600">
              שורה {row.rowIndex}: {row.errors.join(' | ')}
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      {validRows.length > 0 && (
        <ImportConfirmButton
          validCount={validRows.length}
          rows={validRows}
          type={type}
        />
      )}
    </div>
  )
}
```

## Server Action — Bulk Insert

```ts
// src/features/settings/api/importActions.ts
'use server'
import { createServerClient } from '@/lib/supabase/server'
import type { ClientCsvRow } from '../utils/csvValidation'
import type { ActionResult } from '@/lib/types/action.types'

const BATCH_SIZE = 50  // Insert 50 rows at a time

interface ImportResult {
  inserted: number
  skipped: number    // Duplicates by phone number
  errors: string[]
}

export async function importClients(
  rows: ClientCsvRow[]
): Promise<ActionResult<ImportResult>> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'לא מאומת' }

  const { data: userData } = await supabase
    .from('users').select('company_id').eq('id', user.id).single()
  if (!userData) return { success: false, error: 'חברה לא נמצאה' }

  const companyId = userData.company_id
  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  // Process in batches to avoid timeout
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    // Idempotency: check existing phones in this batch
    const phones = batch.map((r) => r.phone)
    const { data: existing } = await supabase
      .from('clients')
      .select('phone_e164')
      .eq('company_id', companyId)
      .in('phone_e164', phones)

    const existingPhones = new Set(existing?.map((c) => c.phone_e164) ?? [])
    const newRows = batch.filter((r) => !existingPhones.has(r.phone))
    skipped += batch.length - newRows.length

    if (newRows.length === 0) continue

    const { error } = await supabase.from('clients').insert(
      newRows.map((r) => ({
        company_id: companyId,
        name: r.name,
        contact_name: r.contact_name,
        phone_e164: r.phone,
        email: r.email || null,
        reliability_score: 50,  // Default for new clients
      }))
    )

    if (error) {
      console.error('[importClients] Batch error:', error)
      errors.push(`שגיאה בשורות ${i + 1}–${i + BATCH_SIZE}`)
    } else {
      inserted += newRows.length
    }
  }

  return {
    success: true,
    data: { inserted, skipped, errors },
  }
}
```

## CSV Template Download

```ts
// Provide downloadable template with correct Hebrew headers
export function downloadClientTemplate() {
  const headers = ['שם', 'שם איש קשר', 'טלפון', 'אימייל']
  const example = ['חברת דוגמה', 'יוסי כהן', '052-1234567', 'yossi@example.com']

  const csv = [headers.join(','), example.join(',')].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })  // BOM for Hebrew Excel
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'תבנית_לקוחות_CashPulse.csv'
  a.click()
  URL.revokeObjectURL(url)
}
```

## Rules
- Always add UTF-8 BOM (`\uFEFF`) to CSV downloads so Excel opens Hebrew correctly
- Parse phone numbers client-side, normalize to E.164 before sending to server
- Use `papaparse` for parsing — don't use built-in split (breaks on quoted fields with commas)
- Process in batches of 50 — never insert 1000 rows in one Supabase call
- Idempotency: skip existing records by unique field (phone for clients, invoice_reference for debts)
- Always show preview before confirming import — no surprise bulk writes
- Download CSV template with BOM + example row to guide users
