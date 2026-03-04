# CLAUDE.md

## Project
CashPulse — Cash-flow cockpit and collections management for Israeli SMBs.
RTL Hebrew-first B2B SaaS. Solo developer, AI-assisted build.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode, no `any`)
- **Styling:** Tailwind CSS v4 + CSS variables for design tokens
- **State:** Zustand (lightweight stores, feature-based)
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions + Storage)
- **Real-time:** Supabase Realtime (WebSocket built-in)
- **WhatsApp:** WhatsApp Cloud API (Meta) via official SDK
- **Payments:** Stripe or PayPlus (Israeli payment links)
- **Hosting:** Vercel
- **Analytics:** PostHog

## Architecture
- Feature-based directory structure (not layer-based)
- `src/features/` — each feature is self-contained (components, hooks, stores, types, api)
- `src/components/ui/` — shared design system components
- `src/lib/` — utilities, supabase client, constants
- `src/app/` — Next.js App Router pages and layouts

## Key Directories
- `src/features/dashboard/` — Cash runway, KPIs, forecast chart
- `src/features/receivables/` — Kanban board, invoice CRUD
- `src/features/cashflow/` — Timeline, transactions, forecast engine
- `src/features/clients/` — Client profiles, reliability scores
- `src/features/whatsapp/` — Reminder templates, send flow, activity log
- `src/features/reports/` — Analytics, funnel, client matrix (Pro)
- `src/features/settings/` — Profile, WhatsApp config, alerts, import/export
- `src/features/auth/` — Login, signup, onboarding flow
- `src/features/landing/` — Marketing landing page

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Vitest
- `npx supabase db push` — Push migrations
- `npx supabase gen types typescript` — Generate DB types

## Conventions
- Named exports only (no default exports except pages)
- All components are functional with hooks
- Server Components by default, 'use client' only when needed
- Error handling: try/catch with structured error types, never silent fails
- All API calls through feature-specific service files
- All Supabase queries use generated types
- RLS policies on every table — no exceptions
- Dates: DD/MM/YYYY display format, ISO strings internally
- Currency: ₪ prefix, comma thousands separator (₪12,500)
- All UI text in Hebrew, hardcoded (no i18n framework for v1)

## RTL Rules
- `<html dir="rtl" lang="he">` always
- Sidebar on the RIGHT side
- All Tailwind utilities use logical properties where possible (ms-, me-, ps-, pe-)
- Charts: X-axis stays LTR (dates flow left-to-right)
- Numbers and currency: always LTR direction within RTL context
- Icons indicating direction (arrows, chevrons) must be mirrored

## Design System — "Soft Financial Zen"
- Aesthetic: Headspace × Linear × Wise
- Fonts: Varela Round (display), Rubik (body), DM Mono (numbers)
- Colors: Sand neutrals (#FAFAF8 base), Mint green primary (#22C55E), Rose soft danger (#E5484D), Honey warning (#FACC15), Lavender pro features (#8B5CF6), WhatsApp green (#25D366)
- Corners: HIGH radius — radius-pill (9999px) for all interactive elements (buttons, tabs, badges), 16px for cards, 24px for modals
- Shadows: Diffused, warm-tinted, NO hard borders on cards — shadows only
- Animations: Spring easing cubic-bezier(0.22, 1, 0.36, 1), staggered card reveals, countUp on KPIs
- Tone of voice: Friendly, warm, emoji-sprinkled. "שימו לב 👋" not "אזהרה!". "בואו נטפל 💪" not "נדרשת פעולה".

## Testing
- Vitest + React Testing Library
- Test files colocated: `Component.test.tsx` next to `Component.tsx`
- TDD workflow: red → green → refactor

## Git
- Conventional commits: feat:, fix:, chore:, refactor:, test:, docs:
- Feature branches: feature/dashboard, feature/kanban, etc.
- PR per feature, squash merge to main
