---
name: design-advanced
description: |
  Advanced component specs for CashPulse — debt row anatomy, WhatsApp composer modal,
  KPI cards with sparklines, activity timeline, Recharts styling, skeleton shapes, and
  per-screen empty state designs. Use when building complex components not covered by
  cashpulse-design, or when you need pixel-level spec for a specific CashPulse component.
  Trigger on: debt row, kanban card, composer, KPI card, chart, timeline, activity feed,
  sparkline, recharts, modal layout, drawer, onboarding illustration.
---

# Advanced Component Specs for CashPulse

## Debt Row — Full Anatomy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [●] [Avatar]  [Client Name bold]    [₪4,500 DM Mono]  [Badge]  [Actions→] │
│               [Due DD/MM/YYYY sm]    [Expected sm]       [Reliability]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

```tsx
// Exact sizing and spacing:
<div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-float">
  {/* Checkbox — 20px */}
  <Checkbox className="h-5 w-5 shrink-0" />

  {/* Client avatar — 40px circle, initials fallback */}
  <div className="flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-full bg-sand-100 text-sm font-semibold text-sand-600">
    {initials(debt.clientName)}
  </div>

  {/* Client + dates — flex-1 */}
  <div className="min-w-0 flex-1">
    <p className="truncate text-sm font-semibold text-ink-900">{debt.clientName}</p>
    <p className="text-xs text-ink-400">
      פירעון {formatDate(debt.due_date)}
      {debt.overdue_days > 0 && (
        <span className="ms-1 text-rose-500">({debt.overdue_days} ימי איחור)</span>
      )}
    </p>
  </div>

  {/* Expected payment — hidden on mobile */}
  <div className="hidden flex-col items-end lg:flex">
    <p className="text-xs text-ink-400">תאריך צפוי</p>
    <p className="text-xs font-medium text-ink-700">
      {debt.expected_payment_date ? formatDate(debt.expected_payment_date) : '—'}
    </p>
    {debt.expected_payment_confidence && (
      <ConfidenceDots confidence={debt.expected_payment_confidence} />
    )}
  </div>

  {/* Amount — DM Mono, right-aligned */}
  <div className="text-end">
    <p className="font-mono text-base font-semibold text-ink-900" dir="ltr">
      ₪{debt.amount_outstanding.toLocaleString('he-IL')}
    </p>
  </div>

  {/* Status badge */}
  <StatusBadge status={debt.status} />

  {/* Actions — reveal on hover */}
  <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity
                  group-hover:opacity-100 md:opacity-100">
    <SendReminderButton debtId={debt.id} compact />
    <MoreMenu debtId={debt.id} />
  </div>
</div>
```

## WhatsApp Composer Modal

```
┌────────────────────────────────────────┐
│  שליחת תזכורת ל-[Client Name]    [×]  │
├────────────────────────────────────────┤
│  [Phone preview: +972-XX-XXX-XXXX]    │
│                                        │
│  טון התזכורת:                          │
│  ┌─────┬──────────┬───────┐           │
│  │ 😊  │   📋     │  💪   │           │
│  │עדין │ ענייני  │ נחוש  │           │
│  └─────┴──────────┴───────┘           │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ [AI-generated Hebrew text area] │ │
│  │ ✨ נוצר ע"י AI       [ערוך]    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ☑ כלול קישור לתשלום                  │
│    https://pay.plus/abc123  [העתק]     │
│                                        │
├────────────────────────────────────────┤
│  [ביטול]          [שלח ב-WhatsApp 💬]  │
└────────────────────────────────────────┘
```

```tsx
export function WhatsAppComposerModal({ debtId, clientName, onClose }: Props) {
  return (
    <Modal title={`שליחת תזכורת ל-${clientName}`} open onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* Phone display */}
        <div className="flex items-center gap-2 rounded-xl bg-sand-50 px-3 py-2">
          <MessageCircle className="h-4 w-4 text-whatsapp shrink-0" />
          <span className="text-sm text-ink-600 font-mono" dir="ltr">{phone}</span>
        </div>

        {/* Tone selector */}
        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">טון התזכורת</p>
          <div className="flex gap-2">
            {TONES.map((tone) => (
              <button key={tone.value}
                      onClick={() => setTone(tone.value)}
                      className={cn(
                        'flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 p-3',
                        'transition-all duration-200 text-sm',
                        selectedTone === tone.value
                          ? 'border-mint-400 bg-mint-50 text-mint-700'
                          : 'border-sand-200 bg-white text-ink-600 hover:border-sand-300'
                      )}>
                <span className="text-xl">{tone.emoji}</span>
                <span className="font-medium">{tone.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message editor */}
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-2xl bg-surface-sunken p-4 text-sm
                       text-ink-900 focus:outline-none focus:ring-2 focus:ring-mint-400"
            dir="rtl"
          />
          <div className="absolute bottom-3 start-3 flex items-center gap-2">
            <span className="text-xs text-lavender-500">✨ נוצר ע"י AI</span>
            <button onClick={regenerate}
                    className="text-xs text-sand-400 hover:text-ink-600 underline">
              ייצר מחדש
            </button>
          </div>
          <span className="absolute bottom-3 end-3 text-xs text-sand-400">
            {message.length}/1000
          </span>
        </div>

        {/* Payment link toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={includeLink} onChange={(e) => setIncludeLink(e.target.checked)}
                 className="h-4 w-4 rounded accent-mint-500" />
          <span className="text-sm text-ink-700">כלול קישור לתשלום</span>
          {includeLink && paymentLinkUrl && (
            <code className="ms-auto text-xs text-ink-400 truncate max-w-32">{paymentLinkUrl}</code>
          )}
        </label>
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">ביטול</button>
        <button onClick={handleSend} disabled={isPending}
                className="btn-whatsapp">
          {isPending ? 'שולח...' : 'שלח ב-WhatsApp 💬'}
        </button>
      </div>
    </Modal>
  )
}
```

## KPI Card — Full Spec

```tsx
interface KpiCardProps {
  label: string              // Hebrew e.g. "סה"כ פתוח"
  value: number
  format: 'currency' | 'number' | 'days'
  trend?: { value: number; label: string }  // +12% מחודש שעבר
  icon: LucideIcon
  iconBg?: string            // Tailwind color e.g. "bg-rose-50"
  iconColor?: string         // e.g. "text-rose-500"
  isLoading?: boolean
}

export function KpiCard({ label, value, format, trend, icon: Icon,
                          iconBg = 'bg-sand-50', iconColor = 'text-sand-500',
                          isLoading }: KpiCardProps) {
  if (isLoading) return <KpiCardSkeleton />

  return (
    <div className="rounded-2xl bg-white p-5 shadow-float
                    hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-sand-400">
            {label}
          </p>
          <p className="font-mono text-3xl font-semibold text-ink-900 tabular-nums" dir="ltr">
            {formatKpiValue(value, format)}
          </p>
          {trend && (
            <span className={cn(
              'flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.value >= 0
                ? 'bg-mint-50 text-mint-700'
                : 'bg-rose-50 text-rose-700'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </span>
          )}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}
```

## Activity Timeline

```tsx
// Event types and their visual specs
const TIMELINE_EVENTS = {
  payment_received:  { icon: '💰', color: 'text-mint-600',  bg: 'bg-mint-50'    },
  reminder_sent:     { icon: '💬', color: 'text-whatsapp',  bg: 'bg-[#E8FBF0]'  },
  reminder_read:     { icon: '✓✓', color: 'text-mint-500',  bg: 'bg-mint-50'    },
  debt_created:      { icon: '📋', color: 'text-sand-500',  bg: 'bg-sand-50'    },
  debt_overdue:      { icon: '⚠️', color: 'text-rose-500',  bg: 'bg-rose-50'    },
  prediction_update: { icon: '🔮', color: 'text-lavender-500', bg: 'bg-lavender-50' },
} as const

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="relative flex flex-col gap-0">
      {/* Vertical connector line */}
      <div className="absolute start-5 top-5 bottom-5 w-px bg-sand-200"
           aria-hidden="true" />

      {events.map((event, i) => {
        const config = TIMELINE_EVENTS[event.action]
        return (
          <div key={event.id} className="relative flex gap-4 pb-4">
            {/* Event icon */}
            <div className={cn(
              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center',
              'rounded-full text-base shadow-sm',
              config.bg
            )}>
              {config.icon}
            </div>
            {/* Event content */}
            <div className="flex-1 pt-1.5">
              <p className="text-sm text-ink-800">{event.description}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                {formatRelativeDate(event.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

## Recharts — CashPulse Styling

```tsx
// All charts use these consistent tokens
const CHART_COLORS = {
  income:   '#22C55E',  // mint-500
  expense:  '#F87171',  // rose-400
  forecast: '#A78BFA',  // lavender-400
  neutral:  '#A8A197',  // sand-400
}

// Cashflow area chart
<AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
  <defs>
    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor={CHART_COLORS.income} stopOpacity={0.15} />
      <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0} />
    </linearGradient>
  </defs>

  {/* Minimal grid — horizontal only, warm color */}
  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DD" vertical={false} />

  {/* X-axis always LTR in RTL layout */}
  <XAxis dataKey="date" reversed={false}  // Never reverse X-axis
         tickFormatter={formatChartDate}
         tick={{ fontFamily: 'DM Mono', fontSize: 11, fill: '#A8A197' }}
         axisLine={false} tickLine={false} />

  <YAxis tickFormatter={(v) => `₪${(v/1000).toFixed(0)}K`}
         tick={{ fontFamily: 'DM Mono', fontSize: 11, fill: '#A8A197' }}
         axisLine={false} tickLine={false} width={56} />

  <Tooltip
    contentStyle={{
      borderRadius: 12, border: 'none',
      boxShadow: '0 4px 16px rgba(28,25,23,0.08)',
      fontFamily: 'Rubik',
      direction: 'rtl',
    }}
    formatter={(value: number) => [`₪${value.toLocaleString('he-IL')}`, '']}
    labelFormatter={formatChartDate}
  />

  <Area dataKey="balance" stroke={CHART_COLORS.income} strokeWidth={2}
        fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: CHART_COLORS.income }} />
</AreaChart>
```

## Mobile Bottom Drawer

```tsx
export function BottomDrawer({ open, title, onClose, children }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm md:hidden"
             onClick={onClose} />
      )}

      {/* Drawer panel */}
      <div className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white',
        'shadow-xl transition-transform duration-300 md:hidden',
        open ? 'translate-y-0' : 'translate-y-full'
      )}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-sand-300" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} aria-label="סגור"
                  className="btn-ghost h-8 w-8 rounded-full p-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Content — max 80vh, scrollable */}
        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: '80vh' }}>
          {children}
        </div>
      </div>
    </>
  )
}
```
