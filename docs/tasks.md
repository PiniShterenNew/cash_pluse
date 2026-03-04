# CashPulse — Development Tasks

## Phase 1: Foundation (Week 1)
- [ ] Initialize Next.js 15 project with TypeScript, Tailwind, ESLint
- [ ] Configure Tailwind with CashPulse design tokens (colors, fonts, spacing, radius, shadows)
- [ ] Set up root layout with RTL, Hebrew, font imports (Varela Round, Rubik, DM Mono)
- [ ] Create Supabase project and link with `supabase init`
- [ ] Create initial migration with all tables from database-schema.md
- [ ] Set up Supabase client (server, browser, middleware)
- [ ] Generate TypeScript types from Supabase
- [ ] Set up Zustand with first store (authStore)
- [ ] Build base UI components: Button, Card, Badge, Input, Tabs, Modal, Skeleton
- [ ] Build app shell: Sidebar (RTL), TopBar, Mobile BottomNav
- [ ] Set up Vitest with happy-dom

## Phase 2: Auth & Onboarding (Week 2)
- [ ] Supabase Auth: email/password + Google OAuth
- [ ] Middleware for route protection
- [ ] Login page (split layout, friendly copy)
- [ ] Signup page
- [ ] Onboarding flow (3 steps)
- [ ] Profile creation trigger (auth → profiles table)

## Phase 3: Dashboard (Week 3)
- [ ] KPI cards (balance, income forecast, expense forecast, runway)
- [ ] Cash forecast chart (area chart with threshold line, color zones)
- [ ] Overdue invoices mini-list with WhatsApp buttons
- [ ] Upcoming events timeline
- [ ] Quick actions row
- [ ] Dashboard empty state
- [ ] Dashboard loading skeleton

## Phase 4: Receivables Board (Week 4)
- [ ] Kanban board with 5 columns
- [ ] Invoice card component
- [ ] Drag & drop between columns
- [ ] Invoice create/edit modal
- [ ] Filter and search
- [ ] Summary bar (totals per status)
- [ ] Supabase Realtime for live status updates
- [ ] Board empty state

## Phase 5: Cash Flow (Week 5)
- [ ] Combined area+bar chart
- [ ] Transactions table (card view on mobile)
- [ ] Add income/expense modals
- [ ] Forecast engine (known inflows - known outflows by date)
- [ ] Danger zone alerts
- [ ] Period selector (14/30/60/90 days)

## Phase 6: WhatsApp (Week 6)
- [ ] WhatsApp Business API setup
- [ ] Reminder modal with 3 template tones
- [ ] WhatsApp bubble preview
- [ ] Send flow + API integration
- [ ] Webhook endpoint for delivery/read receipts
- [ ] Activity log per client
- [ ] Payment link generation

## Phase 7: Polish & Launch (Weeks 7-8)
- [ ] Client profile page
- [ ] Settings pages
- [ ] CSV import flow
- [ ] Reports page (Pro)
- [ ] Responsive QA (mobile, tablet, desktop)
- [ ] RTL QA pass
- [ ] Performance optimization
- [ ] Error boundary and 404 pages
- [ ] Landing page
- [ ] Pricing page
- [ ] Deploy to Vercel
- [ ] Connect custom domain
