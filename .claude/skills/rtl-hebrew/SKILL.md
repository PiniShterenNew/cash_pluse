---
name: rtl-hebrew
description: |
  RTL and Hebrew language patterns for CashPulse. Use when creating any UI component,
  handling text direction, formatting dates/currency in Hebrew context, or fixing RTL
  layout issues. Trigger on: rtl, hebrew, עברית, direction, layout flip, logical properties.
---

# RTL & Hebrew Patterns

## Base Setup
```html
<html dir="rtl" lang="he">
```

## Tailwind Logical Properties

ALWAYS use logical properties instead of physical:

- ms-X (margin-inline-start) instead of ml-X
- me-X (margin-inline-end) instead of mr-X
- ps-X (padding-inline-start) instead of pl-X
- pe-X (padding-inline-end) instead of pr-X
- start-X instead of left-X
- end-X instead of right-X
- text-start instead of text-left
- rounded-s-X instead of rounded-l-X
- border-s-X instead of border-l-X

## Layout Rules

- Sidebar: RIGHT side (start side in RTL)
- Navigation flow: RIGHT → LEFT
- Kanban columns: RIGHT (new) → LEFT (done)
- Progress bars: fill from RIGHT to LEFT
- Breadcrumbs: RIGHT to LEFT with mirrored separators

## Content That Stays LTR

- Numbers: always LTR (use `dir="ltr"` or `direction: ltr` on number containers)
- Currency: ₪12,500 (symbol before number, whole thing LTR)
- Phone numbers: 050-1234567 (LTR)
- Email addresses (LTR)
- URLs (LTR)
- Chart X-axis (dates flow left-to-right)
- Code snippets

## Icons

- Directional icons MUST be mirrored: ChevronRight → ChevronLeft, ArrowRight → ArrowLeft
- Use Tailwind: `rtl:rotate-180` on directional icons
- Non-directional icons (home, settings, search) — do NOT mirror

## Dates

- Display: DD/MM/YYYY (Israeli format)
- Store: ISO 8601 (YYYY-MM-DD)
- Day names: ראשון, שני, שלישי, רביעי, חמישי, שישי, שבת
- Month names: ינואר, פברואר, מרץ, אפריל, מאי, יוני, יולי, אוגוסט, ספטמבר, אוקטובר, נובמבר, דצמבר

## Currency Formatting

```typescript
const formatCurrency = (amount: number): string => {
  return `₪${amount.toLocaleString('he-IL')}`;
};
// ₪12,500  ₪1,200  ₪350
```

## Common Pitfalls

- Flexbox: `flex-row` in RTL already flows right-to-left. Don't add `flex-row-reverse`!
- Absolute positioning: use `start/end` not `left/right`
- Animations: slide-in should come from RIGHT (start) not left
- Scrollbar: appears on LEFT in RTL browsers
- Table alignment: text-start (right-aligned in RTL)
