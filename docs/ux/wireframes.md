# CashPulse Wireframes (Structured Text Specification)

## 1. Dashboard

### 1.1 Desktop Layout
```text
+----------------------------------------------------------------------------------+
| Top Bar: Logo | Global Search | Add Debt (Primary CTA) | User Menu             |
+----------------------------------------------------------------------------------+
| KPI Row: [Open Amount] [Overdue Amount] [Collected 30d] [Predicted 14d Inflow]  |
+----------------------------------------------------------------------------------+
| Left/Main (70%): Receivables Priority List   | Right (30%): Action Panel         |
| - Overdue first                               | - Quick filters                    |
| - Row CTA: Send Reminder                      | - Reminder queue summary           |
| - Status badges + expected payment date       | - Integration health indicators    |
+----------------------------------------------------------------------------------+
| Bottom: Activity Timeline (payments, reminders, failures)                        |
+----------------------------------------------------------------------------------+
```

### 1.2 Mobile Layout
```text
[Header]
[Primary CTA: Add Debt]
[Scrollable KPI cards]
[Tabbed section: Overdue | Due Soon | All]
[Debt cards with quick Send Reminder button]
[Bottom sticky action: Bulk Remind]
```

## 2. Receivables Page

### 2.1 Desktop Layout
```text
+----------------------------------------------------------------------------------+
| Title + total outstanding | Filters | Sort | Bulk Actions                        |
+----------------------------------------------------------------------------------+
| Table Columns: Client | Amount Outstanding | Due Date | Overdue Days | Status    |
|               Expected Payment | Reliability | Last Reminder | Actions           |
+----------------------------------------------------------------------------------+
| Row Actions: Send Reminder | View Client | View History                            |
+----------------------------------------------------------------------------------+
```

### 2.2 Mobile Layout
- Each debt in card format:
  - line 1: client + status
  - line 2: amount + due date
  - line 3: expected payment + reliability
  - actions: remind / details

## 3. Client Page

### 3.1 Desktop Layout
```text
+----------------------------------------------------------------------------------+
| Client Header: Name | Phone | Reliability Score Badge | Add Debt                |
+----------------------------------------------------------------------------------+
| Summary Cards: Open Debt | Paid Total | Avg Days Late | Last Payment            |
+----------------------------------------------------------------------------------+
| Tabs: Debts | Reminders | Activity                                                   |
+----------------------------------------------------------------------------------+
| Debts Tab: list of debts with statuses and actions                                |
+----------------------------------------------------------------------------------+
```

### 3.2 Mobile Layout
- Header with client identity and call/WhatsApp shortcut.
- Accordion sections for debt summary and timeline.
- Sticky "Add Debt" button.

## 4. Add Debt Page

### 4.1 Desktop Layout
```text
+---------------------------------------------------------------+
| Step 1: Select/Create Client                                  |
| Step 2: Debt Details (amount, due date, invoice reference)    |
| Step 3: Review + Create Debt                                  |
+---------------------------------------------------------------+
| Sidebar: Preview reminder message and payment link state       |
+---------------------------------------------------------------+
```

### 4.2 Mobile Layout
- Single-column form.
- Required fields first.
- Sticky submit button with validation summary.

## 5. Interaction Notes
- Primary CTA color reserved for action completion paths.
- Overdue visual language must remain consistent across all pages.
- Inline validation should appear near fields and in summary at submit.
