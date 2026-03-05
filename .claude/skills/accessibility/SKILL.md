---
name: accessibility
description: |
  Accessibility patterns for CashPulse RTL Hebrew interface — ARIA labels in Hebrew,
  keyboard navigation, focus management in modals, color contrast, screen reader support.
  Use when building interactive components, forms, modals, or reviewing a11y compliance.
  Trigger on: accessibility, a11y, aria, keyboard, focus, screen reader, contrast,
  tab order, נגישות, קורא מסך.
---

# Accessibility for CashPulse

## Core Principles
- Hebrew ARIA labels — screen readers read Hebrew, so all labels must be Hebrew
- RTL tab order — Tab goes right-to-left visually (which is DOM order in RTL)
- Color is never the only indicator — always add text/icon alongside color status
- Focus visible at all times — `focus-visible:ring` on all interactive elements

## ARIA Labels — Hebrew First

```tsx
// ✅ All aria-label values in Hebrew
<button aria-label="שלח תזכורת ליוסי כהן">
  <Send className="h-4 w-4" />
</button>

// ✅ Dynamic labels include context
<button
  aria-label={`${isSelected ? 'בטל בחירה' : 'בחר'} חוב של ${clientName} על סך ${amount}`}
  aria-pressed={isSelected}
>
  <Checkbox checked={isSelected} />
</button>

// ✅ Icon-only buttons always have aria-label
<button aria-label="סגור" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// ✅ Status changes announced to screen reader
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {isPending ? 'שולח תזכורת...' : lastAction}
</div>
```

## Focus Management in Modals

```tsx
// src/components/ui/Modal.tsx
'use client'
import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      // Save current focus to restore on close
      previousFocusRef.current = document.activeElement as HTMLElement
      // Move focus into modal on open
      modalRef.current?.focus()
    } else {
      // Restore focus to trigger element on close
      previousFocusRef.current?.focus()
    }
  }, [open])

  // Trap focus inside modal
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose()
      return
    }

    if (e.key !== 'Tab') return

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable || focusable.length === 0) return

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    // In RTL: Shift+Tab goes forward visually
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === last) {
        first.focus()
        e.preventDefault()
      }
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}  // Allows programmatic focus
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center outline-none"
    >
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose}
           aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  )
}
```

## Keyboard Navigation — Global Shortcuts

```tsx
// src/hooks/useKeyboardShortcuts.ts
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only fire if not in input/textarea/select
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (target.contentEditable === 'true') return

      // Israeli-friendly shortcuts (not conflicting with Hebrew input)
      switch (e.key) {
        case 'n':
        case 'N':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            // Open new debt modal
            document.querySelector<HTMLButtonElement>('[data-shortcut="new-debt"]')?.click()
          }
          break
        case '?':
          // Show keyboard shortcuts help
          document.querySelector<HTMLButtonElement>('[data-shortcut="help"]')?.click()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])
}
```

## Focus Ring — Consistent Across All Interactive Elements

```tsx
// All interactive elements must show focus ring when keyboard-navigated
// Use focus-visible (not focus) to avoid ring on mouse clicks

// In Tailwind:
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400 focus-visible:ring-offset-2'

// Button
<button className={`btn-primary ${FOCUS_RING}`}>
  שלח תזכורת
</button>

// Custom interactive element
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  className={`debt-row ${FOCUS_RING} rounded-2xl`}
>
  {/* row content */}
</div>
```

## Status Badges — Never Color Alone

```tsx
// ❌ Color only — screen readers and colorblind users get no info
<span className="h-2 w-2 rounded-full bg-rose-500" />

// ✅ Color + text + optional icon
<span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700">
  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
  באיחור
</span>

// ✅ Charts — never rely only on color for data series
// Add pattern fills or labels directly on bars
```

## Form Accessibility

```tsx
// Every input needs an associated label
<div className="flex flex-col gap-1">
  <label
    htmlFor="amount"
    className="text-sm font-medium text-ink-700"
  >
    סכום
    <span className="text-rose-500 ms-1" aria-label="שדה חובה">*</span>
  </label>
  <input
    id="amount"
    type="number"
    dir="ltr"
    aria-required="true"
    aria-invalid={!!errors.amount}
    aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'}
  />
  <p id="amount-hint" className="text-xs text-ink-400">
    בשקלים (₪)
  </p>
  {errors.amount && (
    <p id="amount-error" role="alert" className="text-xs text-rose-600">
      {errors.amount.message}
    </p>
  )}
</div>
```

## Live Regions — Real-Time Updates

```tsx
// Announce Realtime updates to screen readers
export function LiveStatusAnnouncer({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"  // Visually hidden but announced
    >
      {message}
    </div>
  )
}

// Usage: announce when payment received
<LiveStatusAnnouncer
  message={paymentReceived ? `תשלום התקבל: ₪${amount}` : ''}
/>
```

## Skip Navigation (for keyboard users)

```tsx
// src/app/(dashboard)/layout.tsx — First element in DOM
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50
             focus:rounded-2xl focus:bg-mint-500 focus:px-4 focus:py-2 focus:text-white"
>
  דלג לתוכן הראשי
</a>

{/* ... sidebar ... */}

<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

## Color Contrast Requirements

| Element | Minimum | CashPulse tokens |
|---|---|---|
| Body text | 4.5:1 | `ink-800` on `surface-base` ✓ |
| Large text (18px+) | 3:1 | `ink-600` on white ✓ |
| Status badges | 4.5:1 | `rose-700` on `rose-50` ✓ |
| Placeholder text | 3:1 | `ink-400` on `surface-sunken` ✓ |
| Button text | 4.5:1 | white on `mint-500` ✓ |
| Disabled elements | No requirement | `ink-300` on white |

```ts
// ⚠️ Watch out — honey-400 (#FACC15) on white fails contrast
// Use honey-700 for text on light backgrounds:
// ✅ "text-honey-700 bg-honey-50" for warning text
// ❌ "text-honey-400 bg-white"
```

## Checklist Before Shipping a Component
- [ ] All buttons have text or `aria-label` in Hebrew
- [ ] All form inputs have `<label htmlFor>` association
- [ ] Errors use `role="alert"` or `aria-live="polite"`
- [ ] Interactive custom elements have `role`, `tabIndex`, keyboard handler
- [ ] Focus visible ring on all interactive elements
- [ ] Color status has text/icon redundancy
- [ ] Modal traps focus and restores on close
- [ ] Escape key closes modals/drawers
