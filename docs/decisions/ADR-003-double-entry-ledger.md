---
status: 'accepted'
date: 2026-08-13
decision-makers: Jhon
---

# Model money movements as double-entry postings

## Context and Problem Statement

A record of money moving has to serve two questions that pull in opposite
directions: how much is left in a place, and how much went to a purpose over a
period. Both are read from the same records, so the shape those records take is
what decides whether the two answers can ever contradict each other — and when
they do, nothing announces it. Each figure still looks reasonable on its own
screen.

The tension is between the vocabulary a person uses and the structure that keeps
those figures consistent. A person describes a movement as one amount with a label,
spent this much on that, which is quick to write and immediately readable.
Accounting describes the same movement as something leaving one place and arriving
in another, which never lets the two sides disagree but is a vocabulary nobody
wants to learn in order to write down a coffee.

Some ordinary movements fall straight into the gap between the two: paying off a
card, moving money into savings, or a loan payment that is part debt and part
interest. They are where the shorter way of recording has no honest answer, and
the reason the choice cannot be deferred.

## Considered Options

- Single entry: one amount, a stored type, and categories as a separate dimension.
- Full double entry, exposed to the user as debits and credits.
- Double entry underneath, presented as expense / income / transfer.

## Decision Outcome

Chosen option: "Double entry underneath, presented as expense / income / transfer",
because it is the only option that makes balances impossible to corrupt while
leaving the form the user fills in unchanged.

Accounts are classified by the five elements the IASB Conceptual Framework defines
— assets, liabilities, equity, income and expenses. A category is therefore an
account like any other, and a balance is never stored: it is the sum of its
postings. Every transaction is a list of postings that must add up to zero, and a
write that does not balance is rejected. The transaction type is derived from which
roots its postings touch rather than saved.

The five elements are an accounting standard, not a library convention: GnuCash,
Beancount and hledger implement them independently. Firefly III shows the user only
expense / income / transfer while keeping the ledger underneath, which is the
presentation we copied. US GAAP counts ten elements instead of five, but the extra
ones are corporate reporting subdivisions with no meaning for personal finances.

### Consequences

- Good, because balances cannot drift out of sync — there is nothing stored to drift.
- Good, because cases that had no representation now fall out of the model: transfers
  that are not expenses, debt payments split between principal and interest, and a
  single purchase spread across several categories.
- Good, because the model can be checked against a published standard instead of
  personal preference.
- Bad, because reading a transaction requires the account list to know what it is, so
  views resolve accounts before rendering.
- Bad, because the stored shape is further from what a form needs, and a translation
  layer has to exist in both directions.

## References

- [IASB — Conceptual Framework for Financial Reporting](https://www.ifrs.org/issued-standards/list-of-standards/conceptual-framework/)
- [FASB — Concepts Statement 8, Chapter 4: Elements](https://storage.fasb.org/Concepts_Statement_8-Chapter_4-Elements.pdf)
- [hledger — account types](https://hledger.org/journal.html)
- [Firefly III — Accounts and opening balances](https://docs.firefly-iii.org/explanation/financial-concepts/accounts/)
