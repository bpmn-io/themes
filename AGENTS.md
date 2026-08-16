# AGENTS.md

**Read and apply our central [`AGENTS.md`](https://raw.githubusercontent.com/bpmn-io/.github/refs/heads/main/AGENTS.md) first**, as if written here. The instructions below extend it and take precedence on conflict.

## Theme architecture

Two-layer contract:

1. `assets/tokens.css` and the component adapters are portable, stock shadcn/ui
   defaults. They must not depend on `@camunda/design-system`, `.c4-ui`, or
   Camunda brand tokens.
2. `assets/c4.css` is an opt-in override: it consumes C4 semantic tokens only
   beneath `.c4-ui` and loads after the adapter.

New adapters follow the same split — keep base component packages design-system
neutral; brand-specific mappings live here.

## Testing

Each visual Mocha test is one scenario, rendered into a titled container and
left mounted in start mode. Cover every styled interactive surface using the
component's real interaction path: establish state in test code (never via
manual controls), and give each container ≥600px with `min-height: 0` flex so
panel bodies scroll instead of clipping.

The fixed switcher flips every mounted scenario between Original, Shadcn, and C4,
so C4 needs no duplicate scenarios. Any portaled surface (popups, tooltips,
menus, overlays) must render into the scenario container rather than the document
body, so it stays within the theme scope and is captured.
