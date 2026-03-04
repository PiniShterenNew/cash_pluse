# CashPulse User Flows

## 1. Flow: Add Debt
### Actors
- Business user (owner/member)

### Preconditions
- User authenticated.
- Client exists or can be created inline.

### Main Path
1. User clicks "Add Debt".
2. User selects client and enters amount + due date.
3. User submits form.
4. System validates and creates debt.
5. System generates payment link.
6. User sees debt in receivables list with status and actions.

### Alternate Paths
- Client does not exist -> inline create client then continue.
- Payment link generation delayed -> debt created, link status pending, retry job runs.

### Edge Cases
- Due date in past -> debt immediately overdue.
- Duplicate invoice reference -> warning shown; user may continue.

## 2. Flow: Send Reminder
### Preconditions
- Debt exists and not paid/canceled.
- Client has valid WhatsApp number.

### Main Path
1. User clicks "Send Reminder" on debt row.
2. Message composer opens with template.
3. User edits text (optional).
4. User confirms send.
5. System queues and dispatches WhatsApp message.
6. Reminder record appears in activity timeline.

### Alternate Paths
- WhatsApp integration disconnected -> guided reconnect flow.
- Provider temporary error -> retry and notify user.

## 3. Flow: Client Payment
### Client Path
1. Client receives WhatsApp message with payment link.
2. Client opens link and completes payment in PayPlus hosted page.
3. Provider confirms transaction and emits webhook.

### UX Notes
- Payment page hosted externally; CashPulse tracks status asynchronously.

## 4. Flow: Payment Update via Webhook
### System Path
1. Webhook received.
2. Signature and idempotency validated.
3. Payment record created/updated.
4. Debt amount/status recalculated.
5. Realtime update pushes new state to active users.
6. Activity log entry created.

### Exception Path
- Unknown debt reference -> event parked for reconciliation and support alert.

## 5. Flow: AI Prediction Refresh
### Trigger Events
- New payment succeeded.
- Debt becomes overdue.
- Nightly scheduled recomputation.

### Main Path
1. Prediction service loads features.
2. Computes expected payment date and confidence.
3. Computes client reliability score.
4. Stores snapshot and updates current read fields.
5. UI reflects updated values.

## 6. Flow: Collections Daily Routine (Composite)
1. User opens receivables list.
2. Filters to overdue + high amount.
3. Sends reminders in batch.
4. Monitors payment updates in real time.
5. Reviews remaining high-risk clients and schedules next actions.
