# CashPulse Product Overview

## 1. Product Identity
- **Product name:** CashPulse
- **Category:** B2B SaaS
- **Primary region:** Israel
- **Primary users:** Small and medium businesses (3-50 employees)
- **Domain focus:** Accounts receivable collection workflows (not accounting)

## 2. Problem Statement
Israeli SMBs often send invoices but fail to collect payment on time. The collection process is fragmented across spreadsheets, informal WhatsApp messages, memory-based follow-ups, and manual reconciliation with payment providers.

### 2.1 Current-State Pain
1. **No single source of truth:** Debt data is spread across Excel tabs and chat history.
2. **No reminder discipline:** Reminders depend on individual employee behavior, resulting in inconsistent timing.
3. **No status transparency:** Teams cannot instantly answer "what is overdue right now?"
4. **High cognitive load:** Owners repeatedly decide who to contact next rather than executing a clear queue.
5. **Slow cash conversion cycle:** Delays in reminders and payment friction increase Days Sales Outstanding (DSO).
6. **Poor predictability:** Businesses cannot estimate when expected cash will arrive.

### 2.2 Root Causes
- Collections are treated as ad-hoc communication rather than a structured operational process.
- Existing tools are either too generic (spreadsheets) or too broad (ERP/accounting suites).
- SMB workflows in Israel are WhatsApp-first, but most receivables tools are email-first.

## 3. Product Goals
CashPulse is designed to transform collections from reactive follow-up into an operational system.

### 3.1 Primary Goals
- Centralize all open debts in one actionable receivables list.
- Enable one-click reminder sending via WhatsApp.
- Reduce payment friction through payment links.
- Automatically update status through payment webhooks.
- Improve cash planning through expected payment date prediction.

### 3.2 Business Outcomes
- Shorter collection cycles.
- Higher on-time payment rate.
- Lower manual tracking overhead.
- Better short-term cash predictability.

## 4. Product Scope Definition
CashPulse has a strict scope boundary to keep onboarding and daily usage simple.

### 4.1 In Scope
- Debt record management
- Client records for collection context
- Reminder orchestration via WhatsApp
- Payment link generation and tracking
- Webhook-driven payment status updates
- Collection analytics focused on receivables performance

### 4.2 Out of Scope (MVP and Core Positioning)
- Bookkeeping and full accounting ledgers
- Expense tracking
- Payroll
- Bank reconciliation and open banking
- Invoice generation engine replacement
- ERP workflows

## 5. Value Proposition
### 5.1 Functional Value
- **See who owes money now:** consolidated receivables queue.
- **Take action quickly:** send reminders in seconds.
- **Get paid faster:** client receives direct payment link.
- **Know status without manual checking:** webhook updates close the loop.
- **Forecast incoming cash:** AI-assisted expected payment date.

### 5.2 Experience Value
- Minimal UI complexity.
- Action-first interface.
- Clear status hierarchy (open, due soon, overdue, paid).
- WhatsApp-native reminder channel to match real behavior.

## 6. Product Principles and UX Implications
### 6.1 Action First UX
Every primary screen must contain a dominant next action.
- Receivables list: "Send reminder" and "Mark paid" must be immediately visible.
- Client view: "Add debt" and "Send reminder" should be top-level actions.

### 6.2 Minimal Complexity
- Limit the number of required form fields.
- Default smart values when possible.
- Avoid deep menu nesting.

### 6.3 Fast Interactions
- Target: user can perform the top task within 5-10 seconds after landing.
- Performance requirement: key list views should render fast and support instant filtering.

### 6.4 Clarity
The UI must always answer:
1. Who owes money?
2. Which debts are overdue?
3. What should the user do next?

## 7. Core Workflow Narrative
1. Business user creates a debt record for a client.
2. System creates a payable link through payment provider integration.
3. User sends a WhatsApp reminder containing amount, due context, and payment link.
4. Client opens message and pays.
5. Payment provider emits webhook event.
6. System validates webhook and updates payment/debt status.
7. Receivables list updates in real time.

## 8. Key Personas
### 8.1 Owner-Operator (Primary)
- Runs a small company and personally follows payments.
- Needs immediate clarity and minimal setup.

### 8.2 Office Manager / Bookkeeper (Secondary)
- Manages follow-ups for multiple clients.
- Needs workflow repeatability and status consistency.

### 8.3 Sales/Account Lead (Tertiary)
- Occasionally nudges clients.
- Needs context before contacting client.

## 9. Success Metrics
### 9.1 Product Metrics
- Time to first debt created.
- Reminder send rate per active company.
- Payment link click-to-pay conversion.
- Median time from due date to payment.

### 9.2 Business Metrics
- Reduction in overdue debt volume.
- Improvement in DSO proxy metrics.
- Increase in collected amount within 7/14/30 day windows.

## 10. Constraints and Assumptions
- WhatsApp channel adoption is high in target segment.
- Payment providers can reliably deliver webhooks.
- Data quality is partially dependent on user-entered due dates and client metadata.
- MVP prioritizes a single-company context and basic role model.

## 11. Risks and Mitigations
- **Risk:** Users expect full accounting product.
  - **Mitigation:** Positioning and onboarding copy explicitly state focus on collections only.
- **Risk:** Reminder fatigue lowers effectiveness.
  - **Mitigation:** rule-based cadence and reminder state machine.
- **Risk:** Webhook delivery delays.
  - **Mitigation:** retry handling and reconciliation tasks.

## 12. Non-Functional Expectations
- Data security for financial operations.
- High uptime for reminder and payment status features.
- Auditability for changes to debt/payment state.
- Localized formatting support (currency, dates, phone standards).
