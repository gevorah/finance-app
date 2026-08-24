# ADR Index

Each file records a decision that took arguing: why it was taken, what was turned
down, and what it costs. They exist so the same argument is not had twice, and so
that whoever arrives later does not undo something without knowing what it held up.

## Record

Scope is the reach of the decision: process constrains how changes are made,
architecture constrains every module, module constrains a single module. The
number is an immutable identifier, not a ranking.

| ADR                                            | Scope        | Decision                                                                 |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| [001](ADR-001-fsd-with-next-app-router.md)     | Architecture | Four FSD layers; `src/app` is the routing layer                          |
| [002](ADR-002-money-as-integer-minor-units.md) | Architecture | Money is stored as an integer number of cents, never as a decimal        |
| [003](ADR-003-double-entry-ledger.md)          | Architecture | A movement is postings that sum to zero, with its type derived           |
| [004](ADR-004-debts-as-liability-accounts.md)  | Module       | A debt is a liability account, not an entity of its own                  |
| [005](ADR-005-interface-criteria.md)           | Process      | Each kind of interface decision is settled by the source that governs it |

002, 003 and 004 build on one another and are worth reading in that order: money is
an integer, movements are postings over that money, and a debt is an account inside
those postings.

## Adding one

Copy `_template/ADR-template.md`, assign the next sequential number, name the
file `ADR-XXX-short-english-title.md`, and add its row to the table.

## Format

**MADR minimal**, following Michael Nygard's original template as extended by MADR 4.0, plus a lightweight YAML front-matter (`status`, `date`, `decision-makers`) inspired by YADR.
