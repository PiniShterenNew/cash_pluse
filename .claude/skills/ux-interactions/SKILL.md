---
name: ux-interactions
description: |
  UX interaction patterns for CashPulse — micro-interactions, bulk selection, Kanban
  drag-and-drop, progressive disclosure, onboarding flow, keyboard shortcuts, and
  optimistic UI behavior. Use when designing interactive behaviors, hover states,
  transition flows, or multi-step user journeys. Trigger on: interaction, hover, click,
  drag, select, onboarding, wizard, keyboard, gesture, animation, transition, flow.
---

# UX Interactions for CashPulse

## Micro-Interactions

### Debt Row — Hover Reveal
On hover, action buttons slide in from the start (right in RTL). The row lifts slightly.

```tsx
function DebtRow({ debt }: { debt: Debt }) {
  return (
    <div className="group relative flex items-center gap-4 rounded-2xl bg-white p-4
                    shadow-float transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-lg">

      {/* Main content — always visible */}
      <ClientAvatar name={debt.clientName} />
      <DebtInfo debt={debt} />
      <StatusBadge status={debt.status} />
      <AmountDisplay amount={debt.amount_outstanding} />

      {/* Actions — hidden until hover (or always visible on mobile) */}
      <div className="flex items-center gap-2
                      opacity-0 translate-x-2
                      group-hover:opacity-100 group-hover:translate-x-0
                      transition-all duration-200
                      md:opacity-100 md:translate-x-0">  {/* Always visible on mobile */}
        <SendReminderButton debtId={debt.id} />
        <MoreActionsMenu debtId={debt.id} />
      </div>
    </div>
  )
}
```

### Button Press Feedback
```tsx
// All primary actions get tactile feedback
<button
  className="btn-primary active:scale-[0.97] active:shadow-sm transition-all duration-100"
  onClick={handleSend}
>
  שלח תזכורת
</button>
```

### Status Change Animation
When a debt status changes (paid!), show a brief celebration:
```tsx
function StatusBadge({ status, previousStatus }: { status: DebtStatus; previousStatus?: DebtStatus }) {
  const justPaid = previousStatus !== 'paid' && status === 'paid'

  return (
    <span className={cn(
      'badge',
      justPaid && 'animate-bounce-once'  // Single bounce on transition to paid
    )}>
      {STATUS_LABELS[status]}
    </span>
  )
}
// CSS: @keyframes bounce-once { 0%,100%{transform:none} 50%{transform:translateY(-25%)} }
```

## Bulk Selection UX

```tsx
// Bulk selection appears as sticky bar at bottom when any item selected
'use client'
export function BulkActionBar({ selectedIds, onClearSelection }: BulkActionBarProps) {
  if (selectedIds.length === 0) return null

  return (
    // Slides up from bottom when selection > 0
    <div className="fixed bottom-6 inset-x-4 z-40 mx-auto max-w-2xl
                    animate-slide-up rounded-2xl bg-ink-900 px-4 py-3
                    shadow-xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onClearSelection} aria-label="בטל בחירה"
                className="text-sand-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-white">
          {selectedIds.length} נבחרו
        </span>
      </div>

      <div className="flex items-center gap-2">
        <BulkRemindButton debtIds={selectedIds} onComplete={onClearSelection} />
        <BulkExportButton debtIds={selectedIds} />
      </div>
    </div>
  )
}

// Row checkbox — RTL positioning
function DebtRowCheckbox({ debtId, isSelected, onToggle }: CheckboxProps) {
  return (
    <button
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${isSelected ? 'בטל בחירה' : 'בחר'} שורה`}
      onClick={() => onToggle(debtId)}
      className={cn(
        'h-5 w-5 rounded-md border-2 transition-all duration-150',
        isSelected
          ? 'bg-mint-500 border-mint-500 text-white'
          : 'border-sand-300 hover:border-mint-400'
      )}
    >
      {isSelected && <Check className="h-3 w-3" />}
    </button>
  )
}
```

## Progressive Disclosure

### Debt Row — Expandable Details
```tsx
function DebtRow({ debt }: { debt: Debt }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-2xl bg-white shadow-float overflow-hidden">
      {/* Primary row — always visible */}
      <div className="flex items-center gap-4 p-4 cursor-pointer"
           onClick={() => setIsExpanded((v) => !v)}>
        <ClientAvatar name={debt.clientName} />
        <div className="flex-1">
          <p className="font-semibold text-ink-900">{debt.clientName}</p>
          <p className="text-sm text-ink-400">{formatCurrency(debt.amount_outstanding)}</p>
        </div>
        <StatusBadge status={debt.status} />
        <ChevronDown className={cn(
          'h-4 w-4 text-ink-400 transition-transform duration-200',
          isExpanded && 'rotate-180'
        )} />
      </div>

      {/* Secondary details — revealed on expand */}
      {isExpanded && (
        <div className="border-t border-sand-100 p-4 animate-accordion-down">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ink-400">תאריך פירעון</dt>
              <dd className="font-medium">{formatDate(debt.due_date)}</dd>
            </div>
            <div>
              <dt className="text-ink-400">תאריך צפוי</dt>
              <dd className="font-medium">{debt.expected_payment_date
                ? formatDate(debt.expected_payment_date) : '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-400">תזכורת אחרונה</dt>
              <dd className="font-medium">{debt.last_reminder_sent_at
                ? formatRelativeDate(debt.last_reminder_sent_at) : 'טרם נשלחה'}</dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-2">
            <SendReminderButton debtId={debt.id} />
            <ViewHistoryButton debtId={debt.id} />
          </div>
        </div>
      )}
    </div>
  )
}
```

## Onboarding Flow

3-step wizard: Company Setup → WhatsApp Connect → First Debt

```tsx
// src/features/auth/components/OnboardingWizard.tsx
const STEPS = [
  { id: 'company',   label: 'פרטי העסק',   icon: '🏢' },
  { id: 'whatsapp',  label: 'WhatsApp',     icon: '💬' },
  { id: 'first-debt', label: 'חוב ראשון',  icon: '📋' },
] as const

type StepId = typeof STEPS[number]['id']

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<StepId>('company')
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
              i < currentIndex  && 'bg-mint-500 text-white',
              i === currentIndex && 'bg-mint-500 text-white ring-4 ring-mint-100',
              i > currentIndex  && 'bg-sand-100 text-sand-400',
            )}>
              {i < currentIndex ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn(
              'text-xs font-medium hidden sm:block',
              i === currentIndex ? 'text-ink-800' : 'text-sand-400'
            )}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-px w-8 transition-colors',
                i < currentIndex ? 'bg-mint-400' : 'bg-sand-200'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-3xl bg-white p-6 shadow-float">
        {currentStep === 'company'    && <CompanyStep onNext={() => setCurrentStep('whatsapp')} />}
        {currentStep === 'whatsapp'   && <WhatsAppStep onNext={() => setCurrentStep('first-debt')} onSkip={() => setCurrentStep('first-debt')} />}
        {currentStep === 'first-debt' && <FirstDebtStep onComplete={() => router.push('/dashboard')} />}
      </div>
    </div>
  )
}
```

## Kanban Drag-and-Drop (desktop)

```tsx
// Use @dnd-kit/core for accessible DnD
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

export function KanbanBoard({ columns }: { columns: KanbanColumn[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumnDroppable key={col.status} column={col} />
        ))}
      </div>

      {/* Drag overlay — card follows cursor */}
      <DragOverlay>
        {activeId && (
          <DebtCard
            debt={findDebt(activeId)}
            isDragging
            className="rotate-1 shadow-xl opacity-90"
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Mobile alternative: swipe left on a card to reveal status-change actions
// No drag on mobile — use bottom drawer with status options instead
```

## Optimistic UI — What User Sees

```tsx
// Between user action and server confirmation:
// 1. Apply optimistic state immediately
// 2. Show subtle loading indicator (not full spinner)
// 3. On success: confirm silently (no toast needed for expected actions)
// 4. On failure: revert + show toast with retry

function SendReminderButton({ debtId }: { debtId: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSend() {
    setState('sending')
    const result = await sendReminder(debtId)

    if (result.success) {
      setState('sent')
      setTimeout(() => setState('idle'), 3000)  // Reset after 3s
    } else {
      setState('error')
      toast.error(result.error)
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={state === 'sending' || state === 'sent'}
      className={cn(
        'btn-whatsapp transition-all',
        state === 'sent'    && 'bg-mint-500',   // Confirmation color
        state === 'sending' && 'opacity-70',
        state === 'error'   && 'btn-danger',
      )}
    >
      {state === 'idle'    && <><MessageCircle className="h-4 w-4" /> שלח תזכורת</>}
      {state === 'sending' && <><Loader2 className="h-4 w-4 animate-spin" /> שולח...</>}
      {state === 'sent'    && <><Check className="h-4 w-4" /> נשלח!</>}
      {state === 'error'   && <><X className="h-4 w-4" /> שגיאה — נסה שוב</>}
    </button>
  )
}
```

## Filter Interaction

```tsx
// Filter tabs respond instantly (optimistic filter in client state)
// List fades slightly during pending server refetch

function FilterTabs({ currentFilter, onChange }: FilterTabsProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(filter: DebtStatus | 'all') {
    startTransition(() => onChange(filter))
  }

  return (
    <div className={cn(
      'flex rounded-full bg-sand-100 p-1 transition-opacity',
      isPending && 'opacity-70'
    )}>
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
            currentFilter === opt.value
              ? 'bg-white shadow-sm text-ink-900'
              : 'text-sand-500 hover:text-ink-700'
          )}
          aria-pressed={currentFilter === opt.value}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className="ms-1.5 text-xs opacity-60">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
```

## Interaction Timing Reference

| Interaction | Duration | Easing |
|---|---|---|
| Button hover lift | 150ms | ease-out |
| Button press scale | 100ms | ease-in |
| Card hover lift | 200ms | ease-out |
| Row action reveal | 200ms | cubic-bezier(0.22,1,0.36,1) |
| Modal open | 280ms | spring (0.34,1.56,0.64,1) |
| Filter tab switch | 200ms | ease |
| Bulk bar slide up | 280ms | spring |
| Status badge change | 300ms | ease-out |
| Accordion open | 250ms | ease-out |
| Toast enter | 280ms | spring |
