# CashPulse Technology Stack

## 1. Frontend
### Next.js
- App Router architecture.
- Server and Client Components split for performance.
- Route-based code organization for product domains.

### TypeScript
- Strict typing for domain entities and API contracts.
- Shared types generated from Supabase schema where possible.

### TailwindCSS
- Utility-first styling with design token constraints.
- Component consistency through class composition patterns.

### Zustand
- Lightweight client state management.
- Suitable for UI state and interaction-level state without overengineering.

## 2. Backend and Data
### Supabase
- Managed Postgres database.
- Auth with JWT-based sessions.
- Realtime subscriptions for live status updates.
- Edge Functions for secure integration logic.

### PostgreSQL
- Core transactional data store.
- JSONB support for event payloads and AI explanations.
- Strong indexing and constraint support.

## 3. Integrations
### WhatsApp Cloud API
- Outbound reminder messaging.
- Message lifecycle events (delivery/read where available).

### PayPlus
- Payment link generation.
- Payment lifecycle webhooks.

### OpenAI API
- Reminder message drafting.
- Prediction explanation enrichment.

## 4. Hosting and DevOps
### Vercel
- Frontend hosting and CI/CD deployment flow.
- Environment variable management and preview deployments.

### Supabase Hosting
- Managed DB and backend runtime.

## 5. Analytics
### PostHog
- Product usage tracking.
- Funnel monitoring for debt creation -> reminder -> payment.
- Feature adoption insights.

## 6. Stack Selection Rationale
- **Speed to market:** managed services minimize infrastructure burden.
- **Developer productivity:** full TypeScript workflow reduces interface mismatches.
- **Real-time capability:** native Supabase Realtime covers status update requirements.
- **Integration readiness:** WhatsApp and payment providers are API-first.

## 7. Known Constraints
- Supabase vendor lock-in risk requires abstraction at service boundaries.
- WhatsApp template constraints can limit highly dynamic messaging.
- Payment provider schema changes require versioned webhook mapping.

## 8. Versioning and Compatibility
- Pin critical SDK versions for integration stability.
- Maintain schema migrations as source-controlled artifacts.
- Introduce API versioning for public endpoints as product expands.
