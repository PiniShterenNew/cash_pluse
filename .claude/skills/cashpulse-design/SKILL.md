---
name: cashpulse-design
description: |
  CashPulse UI design system — "Soft Financial Zen" aesthetic. MUST use when building ANY UI
  component, page, screen, layout, or modal for CashPulse. Covers colors, typography, spacing,
  shadows, border-radius, component specs, RTL rules, animation easing, responsive breakpoints,
  and Hebrew copy guidelines. Also use when reviewing visual design, fixing styling issues,
  creating empty states, or implementing responsive layouts.
---

# CashPulse Design System — "Soft Financial Zen"

## Philosophy
CashPulse is a retreat from spreadsheet fatigue. The interface feels floaty, lighter than air.
Inspired by: Headspace (calmness), Linear (refined interactions), Wise (approachable fintech).

5 Principles:
1. FLOAT — everything hovers with diffused shadows, never stuck to surface
2. BREATHE — generous padding/margins/gaps, white space is oxygen
3. PILL — every interactive element is pill-shaped (border-radius: 9999px)
4. WHISPER — never shout. "שימו לב 👋" not "אזהרה!". Even errors are gentle.
5. WARM — sand neutrals, mint green, soft rose. Not clinical white.

## Colors

### Surfaces
- --surface-base: #FAFAF8 (warm cream — THE page background, never #FFF)
- --surface-card: #FFFFFF (cards float above base with shadow)
- --surface-sunken: #F3F1ED (input backgrounds, wells)
- --surface-overlay: rgba(30, 30, 25, 0.3) (modal backdrop + blur)

### Primary — Mint Green
- --mint-50: #F0FDF6, --mint-100: #DCFCE8, --mint-200: #BBF7D1
- --mint-300: #86EFAC, --mint-400: #4ADE80, --mint-500: #22C55E
- --mint-600: #16A34A (hover), --mint-700: #15803D

### Sand Neutrals (warm, not gray)
- --sand-50: #FAFAF8, --sand-100: #F5F3EF, --sand-200: #E8E4DD
- --sand-300: #D4CFC5, --sand-400: #A8A197, --sand-500: #78716C
- --sand-600: #57534E, --sand-700: #44403C, --sand-800: #292524, --sand-900: #1C1917

### Soft Rose (danger — not scary)
- --rose-50: #FFF5F5, --rose-100: #FFE4E4, --rose-200: #FFC9C9
- --rose-400: #F87171, --rose-500: #E5484D, --rose-600: #CE3E44

### Honey (warning — attention not panic)
- --honey-50: #FFFCF0, --honey-100: #FFF3CC, --honey-400: #FACC15, --honey-500: #EAB308

### Lavender (pro features, forecast)
- --lavender-50: #F8F5FF, --lavender-100: #EDE9FE
- --lavender-400: #A78BFA, --lavender-500: #8B5CF6

### WhatsApp
- --whatsapp: #25D366, --whatsapp-hover: #20BD5A, --whatsapp-soft: #E8FBF0

### Semantic
- Income: mint-500, Expense: rose-400, Forecast: lavender-400
- Warning: honey-400, Balance: sand-800, Positive: mint-500, Negative: rose-500

## Typography
- Display/Headlines: "Varela Round" (Google Fonts) — rounded, warm, Hebrew-native
- Body/UI: "Rubik" (Google Fonts) weights 400/500/600
- Money/Numbers: "DM Mono" (Google Fonts) weights 400/500
- Scale: xs=12/1.5, sm=14/1.6, base=16/1.7, lg=18/1.6, xl=22/1.4, 2xl=28/1.3, 3xl=36/1.2, 4xl=48/1.1
- Headlines: letter-spacing -0.02em, Body: 0, Labels: 0.04em

## Spacing & Corners & Shadows
- Spacing base 8px: 4,8,12,16,20,24,32,40,48,64,80,96
- Radius: sm=12px (inputs), md=16px (cards), lg=24px (modals), xl=32px (features), pill=9999px (buttons/tabs/badges)
- NO borders on cards — shadows only!

Shadows (diffused, warm):
- shadow-sm: 0 2px 8px rgba(28,25,23,0.04), 0 1px 2px rgba(28,25,23,0.03)
- shadow-md: 0 4px 16px rgba(28,25,23,0.06), 0 2px 4px rgba(28,25,23,0.03)
- shadow-float: 0 12px 40px rgba(28,25,23,0.07), 0 2px 8px rgba(28,25,23,0.03)
- shadow-lg: 0 8px 32px rgba(28,25,23,0.08), 0 4px 8px rgba(28,25,23,0.03)
- shadow-xl: 0 16px 48px rgba(28,25,23,0.10), 0 8px 16px rgba(28,25,23,0.04)
- shadow-glow: 0 0 24px rgba(34,197,94,0.20), 0 0 8px rgba(34,197,94,0.10)
- shadow-inset: inset 0 2px 4px rgba(28,25,23,0.06)

## Component Specs

### Buttons
- Primary: mint-500 bg, white text, pill, shadow-sm, hover: mint-600 + glow + translateY(-1px)
- Secondary: transparent, 1.5px sand-200 border, pill, hover: sand-50 bg
- Ghost: transparent, no border, sand-500 text, hover: sand-100 bg
- WhatsApp: #25D366 bg, white, pill, WA icon, green glow shadow
- Danger: rose-50 bg, rose-500 text, rose-200 border, pill
- All: padding 12px 28px, Rubik 600, text-sm, transition 280ms cubic-bezier(0.22,1,0.36,1)

### Cards
- Standard: white bg, NO border, radius-md (16px), shadow-float, hover: translateY(-2px) + shadow-lg
- KPI: icon in 48px circle (sand-50 bg) top-right, label (sand-400 xs), value (DM Mono 3xl), trend pill
- Alert: rose-50 bg, border-right 3px rose-300 (RTL)

### Status Badges (pill shape, 4px 14px padding, text-xs, 500 weight)
- "שולם": mint-50 bg, mint-700 text, mint-500 dot
- "ממתין": sand-100 bg, sand-600 text, sand-400 dot
- "מגיע בקרוב": honey-50 bg, honey-600 text, honey-400 dot
- "באיחור": rose-50 bg, rose-600 text, rose-400 dot
- "בגבייה": lavender-50 bg, lavender-600 text, lavender-400 dot
- Each badge has 6px circle dot before text

### Inputs
- Text: sunken bg, 1.5px sand-200 border, radius-sm, inset shadow, focus: mint-400 border + 3px ring
- Money: LTR dir, DM Mono, lg size, ₪ prefix absolute left
- Date: DD/MM/YYYY format

### Tabs (Pill Tabs)
- Container: sand-100 bg, 4px padding, radius-pill
- Active: white bg, shadow-sm, sand-800 text, 600 weight
- Inactive: transparent, sand-500 text, 500 weight
- Animated sliding background between tabs

## Animations
- Easing: cubic-bezier(0.22, 1, 0.36, 1), spring: cubic-bezier(0.34, 1.56, 0.64, 1)
- Cards enter: fadeIn + translateY(16→0) + scale(0.98→1), stagger 60ms, 280ms
- KPI countUp: 0→value, 800ms ease-out
- Charts: clip-path reveal 600ms
- Modal: backdrop 200ms, body slideUp+scale spring 280ms
- Buttons hover: translateY(-1px) 150ms, active: scale(0.97) 100ms
- Skeleton: shimmer sand-100↔sand-50, 1.5s infinite
- Toast: slide-in top-center 280ms, auto-dismiss 5s

## Copy Voice (Hebrew, friendly)
- Greetings by time: "בוקר טוב, [שם] 👋" / "צהריים טובים ☀️" / "ערב טוב 🌙"
- Dashboard healthy: "נראה טוב! 🌿", warning: "שווה לשים לב 👀", danger: "בואו נטפל 💪"
- Runway >60d: "הכל בסדר 🌿", 30-60: "שווה לשים לב 👀", <30: "בואו נטפל בזה 💪"
- Errors: "אופס, משהו לא עבד 😅 — ננסה שוב?"
- Empty: "הדשבורד מחכה לכם! 🌱", "עדיין אין חשבוניות — וזה בסדר! 📑"
- WhatsApp templates: "😊 עדין" / "📋 ענייני" / "💪 נחוש"
- Confirmations: "נשמר! ✓", "התזכורת בדרך 💬", "הנתונים יובאו 🎉"

## Responsive
- Mobile <768px: single column, bottom tab bar (72px, radius-top xl), swipeable kanban
- Tablet 768-1024px: collapsed sidebar 72px (icons), 2-col grid
- Desktop >1024px: full sidebar 280px (on RIGHT), multi-column

## Sidebar (RTL — on the right)
- Desktop: 280px, surface-card bg, shadow-md
- Nav items: pill-shaped active (mint-50 bg, mint-600 text, mint-500 dot)
- Plan badge at bottom: radius-lg, mint-50 bg
- Mobile: hidden, replaced by bottom tab bar
