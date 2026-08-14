---
status: 'accepted'
date: 2026-08-14
decision-makers: Jhon
---

# Keep debts inside the account tree instead of as their own entity

## Context and Problem Statement

A debt is two things at once. It is an amount that changes every time money moves
— which a ledger already knows how to represent and keep correct. And it is a set
of terms that never move on their own: an interest rate, a number of
installments, a due date, a cut-off day. The ledger has no place for the second
kind of information, and no interest in it.

That split invites giving a debt a home of its own, next to the ledger rather
than inside it. The pull the other way is that the moment a debt exists as its
own object, something has to keep it agreed with the ledger, and whatever that
something is will eventually fail quietly — which is the failure the ledger was
adopted to remove.

So the question is not where the balance lives; that is settled. It is whether a
debt remains a thing of its own at all, and if not, where its terms go.

## Considered Options

- A debt entity holding its own outstanding balance.
- A debt entity holding only terms, linked to a liability account that holds the
  balance.
- No debt entity: a liability account, with the terms as descriptive fields on it.

## Decision Outcome

Chosen option: "No debt entity", because the first option keeps two numbers that
can disagree, and the second keeps two objects that can disagree — a debt with no
account, an account with no debt, or an edit applied to one and not the other.
The third has nothing to keep in agreement.

A debt is an account whose root is liabilities. What is owed is its balance, read
as a positive figure. Interest and payment terms hang off the account and are
descriptive only: nothing recalculates them and none of them is a balance.
Whether a debt is settled or overdue is read from its balance and its due date,
and the order in which debts should be paid is an ordering of accounts, so
neither is stored.

This is not forced by the decision to keep a ledger — a terms-only entity beside
an account would satisfy that just as well. What the references settle is the
first half: all of them treat a debt as a liability account whose balance comes
from its postings, with interest as an ongoing expense.

They do not agree on where the terms belong. Firefly III keeps rate and period as
fields on the liability account and states plainly that it calculates nothing from
them. GnuCash puts them somewhere else entirely: its loan assistant stores the
rate and the length of the loan in the scheduled transaction that repays it, and
the account carries no rate at all. We follow Firefly because there is nothing
here yet to schedule a payment with.

### Consequences

- Good, because a payment is an ordinary transaction and the amount owed follows
  from it, with nothing to update by hand and nothing to fall out of step.
- Good, because a credit card stopped being modelled twice, once as an account
  and once as a debt.
- Good, because payoff strategies became orderings over existing data rather than
  a stored priority that has to be maintained.
- Bad, because the account type now carries fields that only apply to one of its
  roots, and a reader may reasonably expect a liability to be its own type.
- Bad, because a debt can no longer be marked as settled directly; it is settled
  by recording the payment that settles it, which is more honest and more typing.
- Bad, because the payment schedule — amount, frequency, next due date — is a
  recurring payment described in a second place. GnuCash keeps exactly that in a
  scheduled transaction. Once recurring transactions exist, the schedule should
  move there and only the rate should stay on the account.

## References

- [GnuCash — Loans: Basic Concepts](https://www.gnucash.org/docs/v5/C/gnucash-guide/loans_concepts1.html)
- [Firefly III — Liabilities](https://docs.firefly-iii.org/explanation/financial-concepts/liabilities/)
- [IASB — Conceptual Framework for Financial Reporting](https://www.ifrs.org/issued-standards/list-of-standards/conceptual-framework/)
