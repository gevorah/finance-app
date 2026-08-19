---
status: 'accepted'
date: 2026-01-06
decision-makers: Jhon
---

# Use Next's app directory as the routing layer instead of an FSD app layer

## Context and Problem Statement

This was decided when the repository was started and recorded in retrospect. The
part about the pages layer was revised later, once the codebase had enough
screens to measure the cost.

A layered architecture and a framework can both claim the right to name the top
of the folder tree. Feature-Sliced Design defines an ordered set of layers and
two of them are called `app` and `pages`; Next's App Router requires a directory
named `app` whose folder names are the URLs, and reserves `src/pages` for the
Pages Router. Neither name is available to FSD, and the collision is not
cosmetic — two different things would answer to the same name, and a reader
could not tell whether a folder is a layer or a route.

Behind the naming there is a question about ownership that the two layers answer
differently. The FSD `app` layer holds app-wide matters: router configuration,
global store, global styles, entrypoint. Next already owns all of that. The FSD
`pages` layer holds the composition of each screen, and Next owns nothing of it
— a route file returns a component and says nothing about where that component
is built.

The decision is where the boundary between framework and architecture sits, and
it turns out to fall in a different place for each of the two names.

## Considered Options

- Rename both FSD layers to `_app` and `_pages`, as the official Next guide
  recommends, and keep both.
- Move the framework's `app` directory to the repository root so `src` holds
  nothing but FSD layers.
- Treat the framework's directory as the routing layer and do without the FSD
  `app` and `pages` layers.
- Treat the framework's directory as the routing layer, drop the FSD `app`
  layer, and keep the `pages` layer under a name Next does not claim.

## Decision Outcome

Chosen option: "drop the FSD `app` layer, keep the `pages` layer under a name
Next does not claim", because the two names turned out to be different problems
wearing the same disguise.

`src/app` is routing and nothing else: a route file imports a page and returns
it. The FSD `app` layer is not recreated, because its documented segments —
`routes`, `store`, `styles`, `entrypoint` — are already `src/app/layout.tsx` and
`src/shared/styles`, and a layer that holds nothing is a folder that has to be
explained.

The `pages` layer stays, as `src/_pages`. The name is the framework's fault:
`src/pages` is where Next looks for the Pages Router, so the layer cannot use
it. The underscore is what the official guide prescribes for exactly this, and
it is the same convention their Astro guide uses.

The layers are `_pages`, widgets, features, entities and shared, in that order,
and imports only travel downwards. Route files may reach into `_pages`; nothing
may reach back into a route.

### Where a block goes

Three of the layers can hold a block of UI, and the methodology separates them
by what the block is rather than by how large it is.

A **page slice** composes one screen. There is no ceiling on it — "There's no
limit to how much code you can place in a page slice as long as your team still
finds it easy to navigate. If a UI block on a page is not reused, it's perfectly
fine to keep it inside the page slice." Two screens that differ only in their
starting data are one slice, the way a registration and a login form are.

A **feature** is an interaction — "the main interactions in your app, things
that your users care to do" — and a form that validates and writes is named as
its typical content. Reuse across pages is an indicator that something should be
extracted, not the definition; the stated goal is that a newcomer discovers what
the app does by reading the pages and features, and the failure mode the
methodology warns about is having too many, not too few.

A **widget** is a large self-sufficient block of UI, useful when it is reused
across several screens or when one screen is built from several large
independent blocks. A block that makes up most of a screen and is not reused is
not a widget; it belongs to that screen.

When a decision touches more than one of these, the deciding question is what
the block is, not how many places call it.

### Consequences

- Good, because there is one obvious place for a route and one for everything
  else, and no prefixed name to explain except the one the framework forces.
- Good, because the layer count matches what the project actually uses: the
  `app` layer is gone because it would be empty, and the `pages` layer is there
  because it is not.
- Good, because a route file stays one line, so the screen it renders can move
  between layers without the URL noticing.
- Bad, because `_pages` reads like a private folder rather than a layer, and
  every reader pays that translation once.
- Bad, because dropping the FSD `app` layer means any app-wide concern that does
  not fit `src/app/layout.tsx` has nowhere obvious to go, and the next one will
  have to argue for its own place.
- Bad, because it still departs from the framework guide, so advice found online
  about combining the two will not match this repository.

## References

- [Feature-Sliced Design — Layers](https://feature-sliced.design/docs/reference/layers)
- [Feature-Sliced Design — Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)
- [Feature-Sliced Design — Using FSD with Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs)
