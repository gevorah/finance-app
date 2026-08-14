---
status: 'accepted'
date: 2026-08-14
decision-makers: Jhon
---

# Use Next's app directory as the routing layer instead of an FSD app layer

## Context and Problem Statement

A layered architecture and a framework can both claim the right to name the top
of the folder tree. Feature-Sliced Design defines an ordered set of layers and
two of them are called `app` and `pages`; Next's App Router requires a directory
named `app` whose folder names are the URLs. The collision is not cosmetic — two
different things would answer to the same name, and a reader could not tell
whether a folder is a layer or a route.

Behind the naming there is a real question about ownership. FSD expects the
composition of a screen to live in a layer it governs. The framework expects the
same composition to live in the file it routes to. Whichever one gives way, the
other stops matching its own documentation.

The decision is where the boundary between framework and architecture sits, for
a codebase small enough that extra structure costs more than it returns.

## Considered Options

- Rename the FSD layers to `_app` and `_pages`, as the official Next guide
  recommends, and keep both.
- Move the framework's `app` directory to the repository root so `src` holds
  nothing but FSD layers.
- Treat the framework's directory as the routing layer and do without the FSD
  `app` and `pages` layers.

## Decision Outcome

Chosen option: "Treat the framework's directory as the routing layer", because
the two layers it replaces would hold almost nothing in an application of this
size, and prefixed folder names cost every reader a translation for the rest of
the project's life.

`src/app` is routing and nothing else. The layers that remain are widgets,
features, entities and shared, in that order, and imports only travel downwards.
Route files may reach into any of them; nothing may reach back into a route.

This is a deliberate deviation from the published guide, which is why it is
written down: the deviation is only defensible while the project stays small, and
a reader who finds no `pages` layer should know it was removed on purpose rather
than forgotten.

### Consequences

- Good, because there is one obvious place for a route and one for everything
  else, with no prefixed names to explain.
- Good, because the layer count matches what the project actually uses.
- Bad, because it departs from the framework guide, so advice found online about
  combining the two will not match this repository.
- Bad, because composition that belongs to a single screen has nowhere to go but
  the route file, which the methodology would rather see in a layer of its own.
  Reusable blocks still belong in widgets; the exception is for screens that are
  never reused.

## References

- [Feature-Sliced Design — Layers](https://feature-sliced.design/docs/reference/layers)
- [Feature-Sliced Design — Using FSD with Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs)
