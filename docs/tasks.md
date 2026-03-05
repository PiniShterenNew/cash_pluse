# CashPulse — Development Tasks
# Last updated: 2026-03-05
# Legend: <!-- skills: X, Y --> = which .claude/skills/ to reference

---

## ✅ Done

_(nothing yet — blank slate as of 2026-03-05)_

---

## 🔄 In Progress

_(nothing yet)_

---

## Phase 1: Foundation
> Goal: Runnable Next.js project with design system, Supabase, and base components

- [ ] Initialize Next.js 15 — TypeScript strict, Tailwind v4, ESLint, src/ dir <!-- skills: nextjs-conventions -->
- [ ] Install all dependencies: Zustand, @supabase/supabase-js, @supabase/ssr, lucide-react, recharts, sonner, react-hook-form, zod, papaparse, @tanstack/react-virtual, @dnd-kit/core, @dnd-kit/sortable, openai <!-- skills: nextjs-conventions -->
- [ ] Configure Tailwind with design tokens: colors (mint, rose, honey, lavender, sand, ink), fonts (Varela Round, Rubik, DM Mono), radius, shadows, shimmer animation <!-- skills: cashpulse-design -->
- [ ] Root layout: `dir="rtl" lang="he"`, font imports, `<Toaster>` provider, metadata <!-- skills: rtl-hebrew, nextjs-conventions -->
- [ ] Create Supabase project + `supabase init` + `supabase link` <!-- skills: supabase-patterns -->
- [ ] Write initial migration: all tables from `docs/database/database_schema.md` <!-- skills: supabase-patterns, create-migration -->
- [ ] Add RLS policies for every table (company_id pattern) <!-- skills: supabase-patterns -->
- [ ] Supabase client files: `src/lib/supabase/server.ts`, `client.ts`, `middleware.ts` <!-- skills: supabase-patterns, nextjs-conventions -->
- [ ] Generate TypeScript types: `src/lib/database.types.ts` <!-- skills: typescript-patterns -->
- [ ] Zustand: `authStore` (user, company_id, session) <!-- skills: state-management -->
- [ ] UI component: `Button` (primary, secondary, ghost, danger, whatsapp variants) <!-- skills: cashpulse-design, build-component -->
- [ ] UI component: `Card` (float, sunken variants) <!-- skills: cashpulse-design, build-component -->
- [ ] UI component: `Badge` / `StatusBadge` (all 8 DebtStatus variants + colors) <!-- skills: cashpulse-design, build-component -->
- [ ] UI component: `Input` + `Label` + `FormField` (with error state) <!-- skills: forms-validation, cashpulse-design, build-component -->
- [ ] UI component: `Tabs` (pill style) <!-- skills: cashpulse-design, build-component -->
- [ ] UI component: `Modal` (with focus trap + Escape key + backdrop) <!-- skills: accessibility, cashpulse-design, build-component -->
- [ ] UI component: `Skeleton` + shimmer animation <!-- skills: ui-patterns, build-component -->
- [ ] UI component: `EmptyState` (icon + title + description + optional CTA) <!-- skills: ui-patterns, build-component -->
- [ ] App shell: `Sidebar` (RTL — right side, nav items, company name) <!-- skills: cashpulse-design, rtl-hebrew -->
- [ ] App shell: `TopBar` (search, notifications, avatar) <!-- skills: cashpulse-design -->
- [ ] App shell: `MobileBottomNav` (5 tabs, RTL) <!-- skills: cashpulse-design, rtl-hebrew -->
- [ ] Set up Vitest + happy-dom + first smoke test <!-- skills: testing -->
- [ ] `.env.local` from `.env.example` — verify all vars populated

## Phase 2: Auth & Onboarding
> Goal: Users can sign up, log in, create a company, complete onboarding

- [ ] Supabase Auth: email/password sign-in + sign-up <!-- skills: supabase-patterns -->
- [ ] Google OAuth setup in Supabase dashboard + callback route <!-- skills: supabase-patterns, nextjs-conventions -->
- [ ] Middleware: protect `/dashboard/**` routes, redirect unauthenticated → `/login` <!-- skills: nextjs-conventions, supabase-patterns -->
- [ ] Login page: split layout (hero left, form right on desktop), friendly Hebrew copy <!-- skills: cashpulse-design, rtl-hebrew, forms-validation, build-screen -->
- [ ] Signup page: same shell as login <!-- skills: cashpulse-design, forms-validation, build-screen -->
- [ ] Auth DB trigger: `on auth.users.INSERT` → create `users` + `companies` row <!-- skills: supabase-patterns -->
- [ ] Onboarding wizard: 3 steps (company details → WhatsApp → first debt), step indicator <!-- skills: ux-interactions, cashpulse-design, forms-validation, build-screen -->
- [ ] Guard: redirect new users (no company debts) to `/onboarding` <!-- skills: nextjs-conventions -->
- [ ] Zustand: populate authStore after sign-in <!-- skills: state-management -->

## Phase 3: Dashboard
> Goal: Users see their financial pulse in one screen

- [ ] Dashboard page route + layout + Suspense sections <!-- skills: nextjs-conventions, data-fetching -->
- [ ] KPI cards: balance, total overdue, income forecast, overdue count — with skeleton <!-- skills: design-advanced, cashpulse-design, data-fetching -->
- [ ] KPI data fetch: Server Component, parallel queries, `unstable_noStore()` <!-- skills: data-fetching, supabase-patterns -->
- [ ] Cash forecast area chart (Recharts, LTR X-axis, RTL-safe tooltip) <!-- skills: design-advanced -->
- [ ] Overdue debts mini-list (top 5, with WhatsApp button) <!-- skills: design-advanced, cashpulse-design -->
- [ ] Upcoming events timeline (next 7 days expected payments) <!-- skills: design-advanced -->
- [ ] Quick actions row (+ חוב חדש, ייצוא, תזכורת bulk) <!-- skills: cashpulse-design, ux-interactions -->
- [ ] Dashboard empty state (no debts yet) <!-- skills: ui-patterns -->
- [ ] Dashboard loading skeleton (KPISkeleton + ForecastSkeleton) <!-- skills: ui-patterns -->
- [ ] Realtime: payment received → refresh KPIs + toast <!-- skills: realtime-subscriptions -->

## Phase 4: Receivables Board
> Goal: Kanban + list for all open debts, real-time updates, full CRUD

- [ ] Receivables page: list view (default) + Kanban view toggle <!-- skills: nextjs-conventions, cashpulse-design, build-screen -->
- [ ] Debt row component: full anatomy (checkbox, avatar, name, dates, amount, badge, actions) <!-- skills: design-advanced, cashpulse-design -->
- [ ] Kanban board: 5 columns (draft, open, due_today, overdue, partially_paid) <!-- skills: cashpulse-design, ux-interactions -->
- [ ] Kanban drag-and-drop between columns (dnd-kit, accessible) <!-- skills: ux-interactions -->
- [ ] Debt create modal: form + Zod schema + Server Action <!-- skills: forms-validation, api-routes, supabase-patterns -->
- [ ] Debt edit modal: pre-populated form + update action <!-- skills: forms-validation, api-routes -->
- [ ] Debt delete: confirm dialog + Server Action <!-- skills: ui-patterns, api-routes -->
- [ ] Filter bar: status tabs, search, sort by due date / amount <!-- skills: ux-interactions, state-management -->
- [ ] Summary bar: total per status column (count + sum) <!-- skills: cashpulse-design -->
- [ ] Supabase Realtime: live status updates on Kanban <!-- skills: realtime-subscriptions -->
- [ ] Bulk selection bar + bulk remind action <!-- skills: ux-interactions -->
- [ ] Board empty state + filtered empty state <!-- skills: ui-patterns -->
- [ ] Virtual list for >50 debts <!-- skills: performance -->
- [ ] Receivables Zustand store (filters, selection, view mode) <!-- skills: state-management -->
- [ ] Debt row tests <!-- skills: testing -->

## Phase 5: Cash Flow
> Goal: Timeline + transactions, forecast, danger alerts

- [ ] Cash flow page layout + route <!-- skills: nextjs-conventions, cashpulse-design, build-screen -->
- [ ] Combined area+bar chart: projected balance + income/expense bars <!-- skills: design-advanced -->
- [ ] Period selector: 14 / 30 / 60 / 90 days (filter chips) <!-- skills: ux-interactions, cashpulse-design -->
- [ ] Transactions table: desktop table + mobile card view <!-- skills: cashpulse-design, ui-patterns -->
- [ ] Add income modal (form + Server Action) <!-- skills: forms-validation, api-routes, supabase-patterns -->
- [ ] Add expense modal (form + Server Action) <!-- skills: forms-validation, api-routes, supabase-patterns -->
- [ ] Forecast engine: group expected payments by date, compute running balance <!-- skills: ai-predictions -->
- [ ] Danger zone alert banner (projected balance < threshold) <!-- skills: cashpulse-design, error-handling -->

## Phase 6: WhatsApp & Payments
> Goal: Send reminders, generate payment links, track delivery

- [ ] PayPlus: generate payment link per debt (Server Action) <!-- skills: payplus-integration, api-routes -->
- [ ] PayPlus webhook endpoint: verify signature, update debt status <!-- skills: payplus-integration, api-routes -->
- [ ] WhatsApp Cloud API: verify credentials + webhook setup <!-- skills: whatsapp-integration -->
- [ ] WhatsApp reminder modal: tone tabs + AI draft + message editor + payment link toggle <!-- skills: design-advanced, whatsapp-integration, openai-integration -->
- [ ] WhatsApp bubble preview component <!-- skills: whatsapp-integration, cashpulse-design -->
- [ ] Send reminder Server Action: API call + save to `reminders` table <!-- skills: whatsapp-integration, api-routes, supabase-patterns -->
- [ ] Webhook `/api/webhooks/whatsapp`: delivery/read receipt → update reminder status <!-- skills: whatsapp-integration, api-routes -->
- [ ] Activity log timeline per client <!-- skills: design-advanced, supabase-patterns -->
- [ ] Realtime: reminder read → toast "הלקוח ראה את ההודעה ✓✓" <!-- skills: realtime-subscriptions -->

## Phase 7: AI Layer
> Goal: Reliability scores, expected payment dates, OpenAI reminder drafts

- [ ] Reliability score algorithm: `src/lib/predictions/reliabilityScore.ts` <!-- skills: ai-predictions -->
- [ ] Expected payment date algorithm: `src/lib/predictions/expectedPaymentDate.ts` <!-- skills: ai-predictions -->
- [ ] Migration: `prediction_snapshots` table + denormalized columns on `debts` + `clients` <!-- skills: ai-predictions, supabase-patterns, create-migration -->
- [ ] Edge Function: `recompute-predictions` — batch score all open debts <!-- skills: ai-predictions, supabase-patterns -->
- [ ] Trigger recompute: after payment webhook, after reminder sent <!-- skills: ai-predictions -->
- [ ] ConfidenceBadge component (3-dot indicator) <!-- skills: ai-predictions, cashpulse-design -->
- [ ] PredictionExplanation expandable component <!-- skills: ai-predictions, design-advanced -->
- [ ] OpenAI: `generateReminderDraft` Server Action (Hebrew, 3 tones, fallback) <!-- skills: openai-integration -->
- [ ] Streaming draft SSE: `/api/ai/reminder-draft` route + client hook <!-- skills: openai-integration -->

## Phase 8: Clients
> Goal: Client profiles with full payment history and reliability score

- [ ] Clients list page (search, filter by score) <!-- skills: cashpulse-design, build-screen, data-fetching -->
- [ ] Client create modal <!-- skills: forms-validation, api-routes -->
- [ ] Client profile page: debt history, payment timeline, reliability score card <!-- skills: design-advanced, cashpulse-design, build-screen -->

## Phase 9: Settings & Import
> Goal: Company settings, WhatsApp config, CSV import

- [ ] Settings layout + nav (profile, WhatsApp, alerts, import) <!-- skills: cashpulse-design, build-screen -->
- [ ] Company profile form <!-- skills: forms-validation, api-routes -->
- [ ] WhatsApp config form (phone number ID, token setup guide) <!-- skills: whatsapp-integration, forms-validation -->
- [ ] CSV import: clients + debts (upload → preview → confirm) <!-- skills: csv-import -->
- [ ] Alert thresholds: configure danger zone % <!-- skills: forms-validation, api-routes -->

## Phase 10: Analytics & Polish
> Goal: PostHog funnel, error handling, a11y, performance

- [ ] PostHog: install + identify user on sign-in <!-- skills: posthog-analytics -->
- [ ] PostHog: instrument core funnel (debt_created, reminder_sent, payment_received, payment_link_clicked) <!-- skills: posthog-analytics -->
- [ ] Error boundary + Hebrew error page <!-- skills: error-handling, nextjs-conventions -->
- [ ] 404 page (Hebrew, warm) <!-- skills: cashpulse-design, nextjs-conventions -->
- [ ] Accessibility audit: Hebrew ARIA, focus management, contrast <!-- skills: accessibility -->
- [ ] Responsive QA: mobile / tablet / desktop pass <!-- skills: cashpulse-design -->
- [ ] RTL QA: check all spacing (ms/me/ps/pe), icon directions, chart X-axis <!-- skills: rtl-hebrew -->
- [ ] Performance: virtualize large lists, dynamic import Recharts, Lighthouse audit <!-- skills: performance -->

## Phase 11: Launch
> Goal: Landing page, Vercel deploy, go live

- [ ] Landing page (marketing, Hebrew) <!-- skills: cashpulse-design, build-screen -->
- [ ] Pricing page (Free + Pro tiers) <!-- skills: cashpulse-design -->
- [ ] Deploy to Vercel: env vars, domain, edge config <!-- skills: nextjs-conventions -->
- [ ] Supabase: enable connection pooling, set up backup <!-- skills: supabase-patterns -->
- [ ] Reports page — Pro tier, behind PostHog feature flag <!-- skills: posthog-analytics, cashpulse-design -->

---

## Post-MVP Backlog
- Automated multi-step reminder sequences
- Bank integration (Open Banking Israel)
- Native mobile app
- Full invoice management
- Multi-user / team members per company
- Advanced financial reporting
