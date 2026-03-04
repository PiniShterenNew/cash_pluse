# CashPulse UX Principles

## 1. Action First UX
### Principle
Users open CashPulse to collect money, not browse reports. The interface must foreground actions.

### Implementation Rules
- Primary action button visible above fold on key screens.
- Row-level actions available without opening detail page.
- Minimize modal chains and confirmation friction.

## 2. Minimal Complexity
### Principle
Reduce cognitive overhead for non-technical SMB users.

### Implementation Rules
- Progressive disclosure: show basic fields first, advanced fields optional.
- Short forms with sensible defaults.
- Avoid dashboard overload; emphasize operational queue.

## 3. Fast Interactions
### Principle
Top task completion should happen within 5-10 seconds.

### Implementation Rules
- Global quick-add debt action always available.
- Receivables list supports instant filters and keyboard navigation.
- Use optimistic updates where safe.

## 4. Clarity and Priority
### Principle
At all times, users must know what requires attention now.

### Visual Hierarchy
- Overdue debts use high-contrast attention style.
- Due-soon uses warning style.
- Paid/canceled deprioritized visually.

### Information Hierarchy
- Amount + due state + next action on same row.
- Secondary metadata collapsed until requested.

## 5. Trust and Transparency
- Show payment status with explicit timestamps.
- Show reminder history with delivery outcomes.
- Display AI confidence and explanation, not opaque numbers.

## 6. Error UX
- Errors must be specific and actionable.
- Failed reminder should expose reason and retry option.
- Never silently fail asynchronous operations.

## 7. Responsive UX
### Desktop
- Multi-column data density for operations users.

### Mobile Web
- Card-based debt rows.
- Sticky action bar for reminder and payment follow-up actions.

## 8. Accessibility Baseline
- Color status indicators must include text/icon redundancy.
- Keyboard-accessible controls on list and forms.
- Sufficient contrast for status badges and CTA buttons.
