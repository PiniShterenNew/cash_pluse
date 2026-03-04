---
description: Build a complete CashPulse screen/page with all components, following the design system and architecture conventions.
---

Build the screen "$ARGUMENTS" for CashPulse.

Before writing any code:
1. Read .claude/skills/cashpulse-design/SKILL.md for the full design system
2. Read .claude/skills/nextjs-conventions/SKILL.md for architecture patterns
3. Read .claude/skills/rtl-hebrew/SKILL.md for RTL rules

Then:
1. Create the page in src/app/ with proper route group
2. Create feature components in src/features/[feature]/components/
3. Create necessary hooks in src/features/[feature]/hooks/
4. Create Zustand store if needed in src/features/[feature]/store.ts
5. Create types in src/features/[feature]/types/
6. Implement loading.tsx with skeleton matching the design system
7. Implement error.tsx with friendly Hebrew error message
8. Make it fully responsive (mobile-first)
9. All text in Hebrew
10. All interactive elements pill-shaped
11. All cards with shadow-float, no borders
12. WhatsApp button (green, pill) wherever there's an overdue invoice
