@AGENTS.md

# Fintrack — Personal Finance App

Offline-first personal finance tracker for Colombian pesos (COP). No backend — all data persisted in localStorage via Zustand.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **State**: Zustand with `persist` middleware (localStorage, versioned)
- **Forms**: react-hook-form + Zod validation
- **UI**: React Aria Components, SCSS modules (BEM), Lucide icons
- **Charts**: Recharts
- **Package manager**: pnpm
- **Testing**: Vitest

## Project Structure (Feature-Sliced Design)

```
src/
  app/            → Next.js routes. Each page.tsx is a one-line re-export from _pages.
  _pages/         → Page compositions. Assembles features into full screens.
  widgets/        → Autonomous UI blocks used at app level (AppShell, BudgetSummary).
  features/       → User-facing functionality (forms, cards, lists, interactions).
  entities/       → Domain models: types, Zustand stores, Zod schemas, selectors.
  shared/         → UI primitives, hooks, and utilities (no domain knowledge).
```

**Import rule**: upper layers import from lower layers, never the reverse.
Order (top → bottom): app > _pages > widgets > features > entities > shared.

## Key Conventions

- **Money in minor units (centavos)**: all amounts stored as integers. Convert with `toMinorUnits()`/`toMajorUnits()` from `@/shared/lib/money`.
- **Balances are always derived**: never stored — computed from transaction postings via selectors.
- **Double-entry ledger**: every transaction has `postings` that must sum to zero. See `@/entities/transaction/model/ledger.ts`.
- **Entity structure**: each entity has `model/types.ts`, `model/store.ts`, `model/schema.ts`, `model/selectors.ts`.
- **Barrel exports**: import from `@/entities/account`, never from internal `model/` paths.
- **Zod schemas live in entities**: validation rules are co-located with the domain model, not with UI forms.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Run tests (vitest)
pnpm test:watch   # Tests in watch mode
pnpm typecheck    # TypeScript check
pnpm lint         # ESLint
pnpm format       # Prettier format
```

## Architecture Decisions

Recorded in `docs/decisions/`. Key ones:
- ADR-001: Feature-Sliced Design with Next.js App Router
- ADR-002: Money as integer minor units
- ADR-003: Double-entry ledger
- ADR-004: Debts as liability accounts
