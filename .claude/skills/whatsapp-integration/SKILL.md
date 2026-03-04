---
name: whatsapp-integration
description: |
  WhatsApp Business Cloud API integration for CashPulse. Use when building the WhatsApp
  reminder feature, creating message templates, implementing send flow, handling webhooks,
  or any WhatsApp-related code. Trigger on: whatsapp, reminder, collection, תזכורת, גבייה.
---

# WhatsApp Integration for CashPulse

## Architecture
- WhatsApp Cloud API (Meta) via official SDK
- Message templates pre-approved via Meta Business Manager
- Webhook endpoint: `/api/webhooks/whatsapp/route.ts`
- Send flow: user picks template → preview → confirm → send via API → log

## Templates (3 tones)
1. "😊 עדין" (gentle) — friendly check-in, apologizes if already paid
2. "📋 ענייני" (business) — straightforward reminder with details
3. "💪 נחוש" (firm) — clear payment expectation with deadline

## Template Variables
- {{client_name}} — שם הלקוח
- {{invoice_number}} — מספר חשבונית
- {{amount}} — סכום (₪X,XXX)
- {{due_date}} — תאריך יעד
- {{days_overdue}} — ימי איחור
- {{payment_link}} — לינק תשלום

## Send Flow
1. User clicks "💬 שלחו תזכורת" on invoice card
2. Modal opens with recipient info, template picker, preview
3. User selects tone, optionally edits, toggles payment link
4. Preview shows as WhatsApp bubble (green bg, rounded)
5. Send → API call → log to whatsapp_messages table
6. Show toast confirmation: "התזכורת בדרך ליוסי 💬"

## Webhook
- Verify webhook signature
- Handle: message_delivered, message_read, message_failed
- Update whatsapp_messages status accordingly
- Show read receipts (✓✓) in communication history

## Rate Limiting
- Max 250 business-initiated messages per 24h (new accounts)
- Track daily count in settings
- Show remaining count in WhatsApp settings
