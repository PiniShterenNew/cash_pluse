# CLAUDE.md

## Project
CashPulse — Cash-flow cockpit & collections management SaaS for Israeli SMBs (3-50 employees).
RTL Hebrew-first. Solo developer, AI-assisted build. March 2026.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode, never use `any`)
- Styling: Tailwind CSS v4, CSS custom properties for design tokens
- State: Zustand (feature-based stores)
- Backend/DB: Supabase (PostgreSQL + Auth + Realtime + Edge Functions + Storage)
- Real-time: Supabase Realtime (WebSocket)
- WhatsApp: WhatsApp Cloud API (Meta) via official SDK
- Payments: PayPlus (Israeli payment gateway — payment links + webhooks)
- Hosting: Vercel
- Analytics: PostHog
- Icons: lucide-react (stroke-width 1.5)
- Charts: Recharts
- Testing: Vitest + React Testing Library + happy-dom
- Package manager: npm

## Architecture
Feature-based directory structure — each feature is self-contained:

```
src/
├── app/                    # Next.js App Router (pages, layouts, api routes)
│   ├── (auth)/             # Auth route group (login, signup)
│   ├── (dashboard)/        # Protected routes group
│   │   ├── dashboard/
│   │   ├── receivables/
│   │   ├── cashflow/
│   │   ├── clients/
│   │   ├── messages/
│   │   ├── reports/
│   │   └── settings/
│   ├── layout.tsx          # Root layout (RTL, fonts, providers)
│   └── page.tsx            # Landing page
├── features/               # Feature modules
│   ├── dashboard/          # KPIs, forecast chart, quick actions
│   ├── receivables/        # Kanban board, invoice CRUD
│   ├── cashflow/           # Timeline, transactions, forecast engine
│   ├── clients/            # Profiles, reliability scores
│   ├── whatsapp/           # Templates, send flow, activity log
│   ├── reports/            # Analytics, funnel, client matrix (Pro)
│   ├── settings/           # Profile, WhatsApp config, alerts, import/export
│   ├── auth/               # Login, signup, onboarding
│   └── landing/            # Marketing landing page
├── components/
│   └── ui/                 # Shared design system components
├── lib/                    # Supabase client, utils, constants, types
├── stores/                 # Zustand stores
└── styles/                 # Global CSS, Tailwind config
```

Each feature folder contains: components/, hooks/, types/, api/, utils/, store.ts

## Commands
- `npm run dev` — Dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm test` — Vitest
- `npx supabase db push` — Push migrations
- `npx supabase gen types typescript --local > src/lib/database.types.ts` — Generate types

## Conventions
- Named exports only (no default exports except Next.js pages)
- Functional components with hooks only
- Server Components by default, `'use client'` only when needed
- Error handling: try/catch with typed errors, never silent fails
- Supabase queries use generated types always
- RLS policies on EVERY table — no exceptions
- Dates display: DD/MM/YYYY (Israeli format), store as ISO
- Currency display: ₪12,500 (₪ prefix, comma thousands, LTR inside RTL)
- All UI text in Hebrew, hardcoded (no i18n for v1)
- Import order: react → next → external → @/ internal → relative → types

## RTL Rules
- `<html dir="rtl" lang="he">`
- Sidebar on the RIGHT side
- Tailwind logical properties: ms-/me-/ps-/pe- instead of ml-/mr-/pl-/pr-
- Charts X-axis stays LTR (dates left-to-right)
- Numbers/currency always LTR within RTL
- Direction icons (arrows, chevrons) — mirrored

## Design System — "Soft Financial Zen"
Aesthetic: Headspace × Linear × Wise. Soft, floaty, warm. See .claude/skills/cashpulse-design/ for full spec.

Key tokens:
- Fonts: "Varela Round" (display), "Rubik" (body), "DM Mono" (numbers)
- Base surface: #FAFAF8 (warm cream)
- Primary: #22C55E (mint green)
- Danger: #E5484D (soft rose)
- Warning: #FACC15 (honey)
- Pro features: #8B5CF6 (lavender)
- WhatsApp: #25D366
- Corners: pill (9999px) for buttons/tabs/badges, 16px cards, 24px modals
- Shadows: diffused, warm-tinted, NO borders on cards
- Tone: friendly, warm, Hebrew, emoji-sprinkled

## Data Model (canonical — resolves schema conflicts)
- Tenant unit: **company** (not user). Use `company_id` for all domain table RLS.
- Core tables: `companies`, `users`, `clients`, `debts`, `payments`, `reminders`, `activity_logs`, `prediction_snapshots`
- Table name: **`debts`** (not `invoices`). The root `docs/database-schema.md` is an outdated draft — see `docs/database/database_schema.md` for authoritative DDL.
- DebtStatus enum: `draft | open | due_today | overdue | partially_paid | paid | canceled | disputed`
- RLS pattern: `company_id = (auth.jwt() ->> 'company_id')::uuid`
- Payment provider: **PayPlus only** (no Stripe)

## Testing
- Vitest + React Testing Library
- Colocated: Component.test.tsx next to Component.tsx
- TDD: red → green → refactor

## Skills Reference (.claude/skills/)
| Skill | When to use |
|---|---|
| `cashpulse-design` | ANY UI component, screen, layout, modal |
| `rtl-hebrew` | RTL layout, Hebrew text, direction |
| `nextjs-conventions` | Pages, layouts, routing, server/client components |
| `supabase-patterns` | DB queries, migrations, RLS, Realtime, auth |
| `state-management` | Zustand stores, optimistic updates |
| `api-routes` | Server Actions, Route Handlers, webhooks |
| `forms-validation` | react-hook-form + Zod, field errors |
| `error-handling` | try/catch, error boundaries, toasts |
| `typescript-patterns` | Types, unions, type guards, no-any |
| `testing` | Vitest, RTL, mocking |
| `whatsapp-integration` | WhatsApp Cloud API, templates, webhooks |
| `payplus-integration` | Payment links, PayPlus webhooks |
| `posthog-analytics` | Event tracking, feature flags |

## Git
- Conventional commits: feat:, fix:, chore:, refactor:, test:, docs:
- Feature branches: feature/dashboard, feature/kanban, etc.
- PR per feature, squash merge to main
