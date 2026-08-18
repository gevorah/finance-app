---
status: 'accepted'
date: 2026-08-13
decision-makers: Jhon
---

# Represent money as an integer number of minor units

## Context and Problem Statement

An amount of money is rarely just displayed. It gets added to other amounts,
compared against a limit and divided into parts, and each of those has to give the
answer a bank would give. The representation chosen for an amount is what decides
that, and getting it wrong is hard to notice: the figure still prints the way it
should while a comparison quietly returns the opposite of the truth.

The tension is between the unit a person reads and the unit a machine holds
exactly. People write and read amounts in the major unit, with decimals, and that
is what forms and screens need. Binary floating point, the default for fractional
numbers, cannot represent most base-10 fractions, so each operation introduces a
small error that survives, accumulates, and eventually flips an equality or an
ordering.

Underneath sits a question that looks like a design choice and is not: how many
decimals an amount has. That is a property of the currency, not of the
application.

## Considered Options

- Floating point in the major unit, rounded when displayed.
- Integers in the major unit, dropping fractions entirely.
- Integers in the minor unit.
- An arbitrary-precision decimal library.

## Decision Outcome

Chosen option: "Integers in the minor unit", because integer arithmetic is exact,
so comparisons and running totals cannot drift, and because it keeps the precision
the bank statement shows instead of inventing a coarser one.

The number of decimals is taken from ISO 4217, which defines a minor unit per
currency. It is a fact to look up, not a decision to make.

Amounts typed by a person and amounts stored by the app are therefore in different
units, and conversion happens only at that boundary. A dedicated type marks which
one a value is in, since both are plain numbers and nothing else would tell them
apart.

An arbitrary-precision decimal library solves the same problem, but adds a
dependency and a wrapper type around every amount. At the scale of personal
finances, integers give the same exactness with none of that.

### Consequences

- Good, because accumulating and comparing amounts is exact by construction, so a
  budget cannot report itself as exceeded when it was met to the cent.
- Good, because the stored precision matches what the bank shows, and the decimal
  count is defensible per currency instead of chosen.
- Bad, because a stored amount no longer reads as the number a person recognises,
  which makes stored data harder to inspect by eye.
- Bad, because a missed conversion at the boundary is off by a factor of one
  hundred and fails silently — nothing crashes, the figure is simply wrong.

## References

- [Martin Fowler — Money (Patterns of Enterprise Application Architecture)](http://thierryroussel.free.fr/java/books/martinfowler/www.martinfowler.com/isa/money.html)
- [Stripe API — amounts in the smallest currency unit](https://docs.stripe.com/api/payment_intents/create)
- [Stripe — zero-decimal and three-decimal currencies](https://docs.stripe.com/currencies.md)
