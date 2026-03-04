---
name: forms-validation
description: |
  Form handling and validation patterns for CashPulse using react-hook-form and Zod.
  Use when building forms, input validation, field errors, multi-step forms, or file
  upload flows. Trigger on: form, input, validation, react-hook-form, zod, schema,
  field error, submit, register, control, useForm.
---

# Forms & Validation for CashPulse

## Stack
- **Form state:** react-hook-form v7
- **Validation schema:** Zod (shared with Server Action schema)
- **Resolver:** `@hookform/resolvers/zod`
- All forms in Hebrew, RTL layout

## Basic Form Pattern

```tsx
// src/features/receivables/components/CreateDebtForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTransition } from 'react'
import { createDebt } from '../api/actions'

const schema = z.object({
  clientId: z.string().uuid('בחר לקוח'),
  amountTotal: z
    .number({ invalid_type_error: 'הכנס סכום' })
    .positive('הסכום חייב להיות חיובי')
    .max(10_000_000, 'סכום גבוה מדי'),
  dueDate: z.string().min(1, 'בחר תאריך פירעון'),
  invoiceReference: z.string().max(100).optional(),
  title: z.string().min(1, 'הכנס תיאור').max(200),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSuccess: (debtId: string) => void
}

export function CreateDebtForm({ onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amountTotal: undefined,
      dueDate: '',
      title: '',
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createDebt({ ...values, currency: 'ILS' })

      if (result.success) {
        reset()
        onSuccess(result.data.id)
      } else {
        // Map server errors back to fields if applicable
        setError('root', { message: result.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Root error */}
      {errors.root && (
        <p role="alert" className="text-sm text-danger-600">{errors.root.message}</p>
      )}

      {/* Amount field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm font-medium text-ink-700">סכום (₪)</label>
        <input
          id="amount"
          type="number"
          dir="ltr"
          className="input-base"
          aria-invalid={!!errors.amountTotal}
          aria-describedby={errors.amountTotal ? 'amount-error' : undefined}
          {...register('amountTotal', { valueAsNumber: true })}
        />
        {errors.amountTotal && (
          <p id="amount-error" role="alert" className="text-xs text-danger-600">
            {errors.amountTotal.message}
          </p>
        )}
      </div>

      {/* Due date */}
      <div className="flex flex-col gap-1">
        <label htmlFor="dueDate" className="text-sm font-medium text-ink-700">תאריך פירעון</label>
        <input
          id="dueDate"
          type="date"
          dir="ltr"
          className="input-base"
          aria-invalid={!!errors.dueDate}
          {...register('dueDate')}
        />
        {errors.dueDate && (
          <p role="alert" className="text-xs text-danger-600">{errors.dueDate.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || isSubmitting}
        className="btn-primary"
      >
        {isPending ? 'שומר...' : 'צור חוב'}
      </button>
    </form>
  )
}
```

## Select / Combobox Field Pattern

```tsx
// For controlled selects (e.g., client picker)
import { Controller } from 'react-hook-form'

<Controller
  name="clientId"
  control={control}
  render={({ field }) => (
    <ClientCombobox
      value={field.value}
      onChange={field.onChange}
      error={errors.clientId?.message}
    />
  )}
/>
```

## Field Error Component (reusable)

```tsx
// src/components/ui/FieldError.tsx
interface Props {
  message?: string
  id?: string
}

export function FieldError({ message, id }: Props) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs text-danger-600 mt-1">
      {message}
    </p>
  )
}
```

## Multi-Step Form Pattern

```tsx
'use client'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Use FormProvider to share form state across step components
export function OnboardingWizard() {
  const [step, setStep] = useState<'company' | 'whatsapp' | 'done'>('company')
  const methods = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange', // validate on change for multi-step
  })

  return (
    <FormProvider {...methods}>
      {step === 'company' && <CompanyStep onNext={() => setStep('whatsapp')} />}
      {step === 'whatsapp' && <WhatsAppStep onNext={() => setStep('done')} />}
    </FormProvider>
  )
}

// Each step accesses form via useFormContext
import { useFormContext } from 'react-hook-form'

function CompanyStep({ onNext }: { onNext: () => void }) {
  const { register, trigger, formState: { errors } } = useFormContext<OnboardingValues>()

  async function handleNext() {
    const isValid = await trigger(['companyName', 'sector'])
    if (isValid) onNext()
  }

  return (/* ... */)
}
```

## Validation Messages (Hebrew)

```ts
// src/lib/validation/messages.ts
export const MESSAGES = {
  required: 'שדה חובה',
  email: 'כתובת אימייל לא תקינה',
  phone: 'מספר טלפון לא תקין (פורמט: +972XXXXXXXXX)',
  positive: 'הערך חייב להיות חיובי',
  uuid: 'ערך לא תקין',
  maxLength: (n: number) => `מקסימום ${n} תווים`,
  minLength: (n: number) => `מינימום ${n} תווים`,
} as const
```

## Phone Validation (Israeli)

```ts
const phoneSchema = z
  .string()
  .regex(/^\+972[1-9]\d{8}$/, 'פורמט: +972XXXXXXXXX')
```

## Amount / Currency Validation

```ts
const amountSchema = z
  .number({ invalid_type_error: 'הכנס סכום תקין' })
  .positive('הסכום חייב להיות חיובי')
  .multipleOf(0.01, 'עד 2 ספרות אחרי הנקודה')
  .max(10_000_000, 'סכום גבוה מדי')
```

## Input CSS Classes (design system)

```
input-base = rounded-xl bg-[#F3F1ED] border-0 px-4 py-3 text-ink-900 focus:ring-2 focus:ring-primary-400 placeholder:text-ink-400
input-error = ring-2 ring-danger-400
```

## Rules
- Always `noValidate` on `<form>` — prevent browser native validation
- Numbers: use `type="number"` + `dir="ltr"` for currency inputs
- Date inputs: `dir="ltr"` for the date picker widget itself
- Use `useTransition` for the server call, not `isSubmitting` alone
- Never use `any` for form values — always infer from Zod schema
- Share Zod schema between form client side and Server Action for single source of truth
