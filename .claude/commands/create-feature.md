---
description: Scaffold a complete feature module for CashPulse with all boilerplate files.
---

Scaffold the feature "$ARGUMENTS" for CashPulse.

Create this structure under src/features/$ARGUMENTS/:

```
$ARGUMENTS/
├── components/       # Feature-specific components
│   └── index.ts      # Barrel exports
├── hooks/            # Custom hooks
│   └── index.ts
├── types/            # TypeScript types
│   └── index.ts
├── api/              # Server actions & API calls
│   └── actions.ts    # 'use server' actions
├── utils/            # Feature utilities
│   └── index.ts
├── store.ts          # Zustand store (if needed)
└── index.ts          # Public API barrel export
```

Each file should have:
- Proper TypeScript types
- JSDoc comments
- Named exports only
- Follow CashPulse conventions from CLAUDE.md
