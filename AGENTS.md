# AGENTS.md

**Read and apply our central [`AGENTS.md`](https://raw.githubusercontent.com/bpmn-io/.github/refs/heads/main/AGENTS.md) first**, as if written here. The instructions below extend it and take precedence on conflict.

## Theme architecture

`assets/tokens.css` binds the bpmn.io semantic tokens (`--bio-*`) to Camunda
Design System tokens, and the component adapters carry only the places where
this theme departs from the default token semantics. Everything applies beneath
`.c4-ui`, so the theme requires `@camunda/design-system` and renders unstyled
without it.

Structure (radii, spacing, control heights, ghost buttons) stays shadcn-derived;
colour always comes from C4 tokens — never a literal, and never a shadcn
palette value.

New adapters follow the same split: keep base component packages design-system
neutral; brand-specific mappings live here.

## Design system source of truth

`camunda/design-system` decides what a binding may point at:

| Source | Use for |
| --- | --- |
| `src/index.css` | Token values, under `.c4-ui` and `.c4-ui.dark`. |
| `docs/kb/ds-token-reference.md` | Which token carries which role. |
| `docs/specs/shadcn/tokens-and-layout.md` | Naming patterns and colour usage rules. |
| `AGENTS.md` §"Absolute rules" | Rule 2, "Semantic tokens only". |

Bind to a named token, not to an alpha mix of one — a mix hides that the design
system already has a step, and does not flip with dark mode. Mix only where the
design system has nothing to point at: focus-ring alpha, the inverted surface
(there is no "on inverted" scale), and shadow colour (`--shadow-*` are whole
box-shadow values, not the colour our libraries take). Names encode role, not
hue: `primary` is the highest-emphasis action, `accent` the brand scale,
`neutral` the grayscale chrome.

Check how a name is declared before pointing at it. Colours and shadows are
variables; radius is not — `--radius-*` lives in `@theme inline` and resolves
only into the `rounded-*` utilities, so `assets/tokens.css` re-derives the steps
from `--radius`.

Dark mode: the design system flips its tokens under `.dark .c4-ui` and
`.c4-ui.dark`. Mirror exactly those two.

Tailwind preflight is scoped to `.c4-ui`, resetting every bpmn.io element
beneath it (`box-sizing`, `margin`, `padding`, `border`). It carries zero
specificity, so a component rule that declares the property wins — anything
relying on a user-agent default does not.

## Testing

Each visual Mocha test is one scenario, rendered into a titled container and
left mounted in start mode. Cover every styled interactive surface using the
component's real interaction path: establish state in test code (never via
manual controls), and give each container ≥600px with `min-height: 0` flex so
panel bodies scroll instead of clipping.

The fixed switcher flips every mounted scenario between bpmn-io and C4, so C4
needs no duplicate scenarios. Any portaled surface (popups, tooltips,
menus, overlays) must render into the scenario container rather than the document
body, so it stays within the theme scope and is captured.

## Capturing theme comparisons

`npm run capture` renders the real specs (the single source of truth) to the
gitignored `.captures/` — one side-by-side comparison image per scenario
(bpmn-io / C4 light / C4 dark). `--no-shots` exports HTML only;
`--grep <pattern>` selects a subset. The capture hook
(`test/spec/capture.spec.js`) is gated by `CAPTURE` and no-ops during `npm run all`.
