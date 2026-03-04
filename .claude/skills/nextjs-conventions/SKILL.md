---
name: nextjs-conventions
description: |
  Next.js 15 App Router conventions and patterns for CashPulse. Use when creating pages,
  layouts, API routes, server actions, middleware, loading/error states, or any Next.js
  specific code. Also use when deciding between server/client components or data fetching patterns.
---

# Next.js 15 Conventions for CashPulse

## App Router Structure
- All pages in `src/app/` using folder-based routing
- Route groups: `(auth)` for login/signup, `(dashboard)` for protected routes
- `layout.tsx` at each level for shared UI
- `loading.tsx` for Suspense boundaries (use skeleton components from design system)
- `error.tsx` for error boundaries (friendly Hebrew messages)
- `not-found.tsx` with warm empty state

## Server vs Client Components
- DEFAULT to Server Components
- Use `'use client'` ONLY for: interactivity (onClick, onChange), hooks (useState, useEffect), browser APIs, Zustand stores
- Keep client components small and leaf-level
- Pass server data DOWN to client components via props

## Data Fetching
- Server Components: direct Supabase queries (using server client)
- Client Components: Zustand stores with async actions
- No `getServerSideProps` / `getStaticProps` (App Router!)
- Use `cache()` and `revalidatePath()` for caching

## Server Actions
- Place in `src/features/[feature]/api/actions.ts`
- Always `'use server'` at top
- Validate with Zod schemas
- Return typed results: `{ success: true, data } | { success: false, error }`

## API Routes
- Place in `src/app/api/[endpoint]/route.ts`
- Use for webhooks (WhatsApp, Stripe) and external integrations only
- Internal data: prefer Server Actions over API routes

## Middleware
- `src/middleware.ts` for auth protection
- Redirect unauthenticated users to /login
- Redirect authenticated users from /login to /dashboard

## File Naming
- Components: PascalCase.tsx (DashboardKPIs.tsx)
- Hooks: camelCase.ts (useCashForecast.ts)
- Utils: camelCase.ts (formatCurrency.ts)
- Types: camelCase.ts (invoice.types.ts)
- Stores: camelCase.ts (dashboardStore.ts)
- Actions: camelCase.ts (actions.ts)
