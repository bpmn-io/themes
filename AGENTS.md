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
