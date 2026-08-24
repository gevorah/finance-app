---
status: 'accepted'
date: 2026-08-24
decision-makers: Jhon
---

# Four FSD layers, with Next's `app` directory as the routing layer

## Context and Problem Statement

Feature-Sliced Design names two of its layers `app` and `pages`, and Next's App
Router claims both directory names for itself. Neither name is available, and the
collision is not cosmetic — a reader could not tell whether a folder is a layer or
a route.

Behind the naming there is a question about ownership that the two layers answer
differently, and a second one about how many of the remaining layers this project
actually fills. Two people of very different experience read the same tree, so a
layer that has to be explained before it can be used is a cost, not a structure.

## Considered Options

- Rename the colliding layers to `_app` and `_pages`, as the Next guide
  recommends, and keep both.
- Move the framework's `app` directory to the repository root, so `src` holds
  nothing but FSD layers.
- Treat the framework's directory as the routing layer, and keep only the FSD
  layers that hold something.

## Decision Outcome

Chosen option: "treat the framework's directory as the routing layer", because
the two names turned out to be different problems wearing the same disguise.

For `app`, the framework already owns what the layer is for. The FSD `app` layer
holds router configuration, global store, global styles and the entrypoint; those
are `src/app/layout.tsx` and `src/shared/styles` here. Recreating the layer would
produce a folder that holds nothing and still has to be explained, so `src/app`
is routing and the root layout, and nothing else.

For `pages`, the framework owns none of it. A route file returns a component and
says nothing about where that component is built, so the layer has real work to
do and stays. It cannot keep its name — `src/pages` is where Next looks for the
Pages Router — so it is `src/_pages`, the prefix the official Next guide
prescribes for exactly this.

The remaining layers are the ones the project fills. FSD is explicit that
"You don't have to use every layer in your project", and the count is meant to
match the code rather than the methodology's ceiling.

The layers are `_pages`, `features`, `entities` and `shared`, in that order.
Imports only travel downwards, enforced by `import/no-restricted-paths`. Route
files may reach into `_pages`; nothing may reach back into a route.

### Consequences

- Good, because there is one obvious place for a route and one for each kind of
  code, and only one prefixed name to explain.
- Good, because a route file stays one line, so a screen can move without the URL
  noticing.
- Good, because the layer count matches what the project uses, so there is no
  layer whose purpose has to be argued before code can be put in it.
- Bad, because `_pages` reads like a private folder rather than a layer, and every
  reader pays that translation once.
- Bad, because app-wide concerns that do not fit `src/app/layout.tsx` have nowhere
  obvious to go, and the next one will have to argue for its own place.
- Bad, because it departs from the framework guide, so advice found online about
  combining the two will not match this repository.

## References

- [Feature-Sliced Design — Layers](https://feature-sliced.design/docs/reference/layers)
- [Feature-Sliced Design — Using FSD with Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs)
- [Next.js — Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure)
