---
status: 'accepted'
date: 2026-08-18
decision-makers: Jhon
---

# Settle interface decisions by assigning authority per decision domain

## Context and Problem Statement

Interface arguments have no natural end. Everyone in them has taste, taste feels
like reasoning, and the person who argues longest wins. The cost is not the
argument itself but that the same one returns every few screens, and that what
gets built swings with whoever was more insistent that week.

The model side of this codebase does not have that problem. A balance question
is answered by a standard and a reference implementation, and the discussion
stops. The interface side had nothing playing that role, so decisions about
forms, errors and disclosure were being made — and defended afterwards with
whatever source happened to support them, which is the same as having none.

What is missing is not a style guide. It is an agreed map of authority: which
source governs which kind of interface decision, and what to do when a
decision touches more than one domain or none of the published sources
actually address it.

## Considered Options

- No written criteria: decide case by case and defend afterwards.
- Adopt one design system wholesale and follow it everywhere.
- Assign each published source authority over the domain it actually covers.

## Decision Outcome

Chosen option: "Assign each published source authority over the domain it
actually covers", because no single system covers the accessibility floor,
component behaviour, form flow and general usability at once, and because most
of these sources do not compete — they answer different questions, so ranking
them against each other would be answering a question nobody asked.

**Accessibility requirements** are governed by WCAG 2.2 (W3C), Level AA. It is
the standard this project adopts as its accessibility baseline, and it applies
as a constraint across every other domain below — a form's wording, a
component's keyboard behaviour and a colour choice all still have to satisfy
it. Nothing overrides it, and a criterion being inconvenient is not a reason
to miss it. Where the question is cognitive load rather than conformance —
memory, plain language, preventing and recovering from mistakes — the W3C's
Making Content Usable supplements it without being a conformance target.

**Component interaction** — keyboard, focus, semantics — is governed by the
ARIA Authoring Practices Guide. It is guidance rather than a specification,
but it is the closest thing to settled practice for widget behaviour. Where
the project's component library already implements a pattern its behaviour is
the default, and rebuilding it by hand needs a reason; where the library has
no equivalent, APG is what the custom widget is measured against. If the two
ever disagree, APG wins: a library is an implementation, not an authority.

**Form design** — how required information is asked for, grouped, sequenced,
validated and explained — is governed by the GOV.UK Design System and Service
Manual, with Adam Silver's Form Design Patterns alongside them. None of them
was chosen for how widely it is adopted: they are the published,
research-backed guidance that exists for this domain, which the
component-oriented design systems do not cover at all. Their authority stops
where visual language begins.

**General usability** questions not covered above are informed by Nielsen
Norman Group research. It is an independent firm, not a standard, and some of
its evidence is qualitative. It is consulted only where the sources above
are silent; it informs, it does not settle.

**Visual identity** is the project's own. External references do not prescribe
the project's visual language — colour, type, spacing, branding — but
accessibility requirements still constrain it: contrast, focus indicators, not
relying on colour alone, and the rest of WCAG apply regardless.

**Project-specific evidence** outranks generic guidance. Usability testing,
observed user behaviour, validated product requirements, problems users run
into repeatedly, and evidence from actual use of the product can justify
departing from the form and usability guidance above, or from an established
component-library interaction, when the product context warrants it.
Accessibility requirements remain non-negotiable, and deviations from
established component behaviour still need an explicit reason.

In practice, resolving a decision means: identify what kind of decision it is,
consult the source responsible for that domain, and check the result against
WCAG regardless of source. Where no source speaks to it, decide and move on.
Where one does and is being departed from, the departure needs project-specific
evidence and a line saying why — not a design doc, just enough that "it looked
better this way" is not sufficient on its own.

### Consequences

- Good, because a disagreement now maps to the source responsible for that
  kind of decision, instead of to whoever argues longest.
- Good, because accessibility stays a constraint on every domain instead of a
  pass done at the end.
- Good, because project-specific evidence has an explicit place to override
  generic guidance, so "what the research says" and "what actually works for
  our users" are not forced into conflict.
- Good, because these are informed defaults, not rules applied blindly — a
  departure is allowed as long as it is documented.
- Bad, because following the form guidance produces plainer screens than a
  prototype usually promises, and that tension has to be resolved every time
  rather than once.
- Bad, because none of these sources was written for a personal finance app
  used daily by its owner, so their assumptions about infrequent and
  unfamiliar use have to be questioned rather than applied.
- Bad, because checking a decision against a source, and writing up the
  exceptions when it does not fit, is slower than just deciding, and the
  cost lands on every screen that does not fit a default.

## References

- [W3C — Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C WAI — ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [W3C WAI — Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK Service Manual — Design](https://www.gov.uk/service-manual/design)
- [Adam Silver — Form Design Patterns (Smashing Magazine)](https://www.smashingmagazine.com/printed-books/form-design-patterns/)
- [Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
