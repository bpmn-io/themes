# bpmn.io Themes

[![CI](https://github.com/bpmn-io/themes/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/themes/actions/workflows/CI.yml)

The shared design-token layer for bpmn.io, and the themes built on top of it.

| Package | Description |
| --- | --- |
| [`@bpmn-io/theme`](./packages/theme) | The design tokens and the default bpmn.io look. Consumed by the libraries themselves. |
| [`@bpmn-io/shadcn-theme`](./packages/shadcn-theme) | A [shadcn/ui](https://ui.shadcn.com/) theme, with an optional [Camunda Design System](https://github.com/camunda/design-system) override. |

## Applying a theme

Put the theme class on your application root:

```html
<body class="bpmn-io-shadcn-theme">
```

The libraries mark their own roots with `bio-theme-parent`, including UI that
renders outside them — the popups and tooltips attach to `document.body`.

A theme works by rebinding the `--bio-*` tokens, which is what lets one theme
cover every bpmn.io component at once. See [`@bpmn-io/theme`](./packages/theme)
for the tokens and how libraries consume them.

## Build and Run

```sh
npm install

# lint and run all tests
npm run all

# run all tests
npm test

# spin up the canonical playground
npm start

# capture side-by-side theme comparison screenshots into .captures/
npm run capture
```

## Releasing

Packages are versioned independently. [`bio-release`](https://github.com/bpmn-io/release)
detects what changed since each package's last release, asks for a bump, then
publishes and tags:

```sh
npm run release
```

## License

MIT
