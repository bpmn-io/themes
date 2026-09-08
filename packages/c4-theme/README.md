# @bpmn-io/c4-theme

[![CI](https://github.com/bpmn-io/themes/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/themes/actions/workflows/CI.yml)

Makes bpmn.io look like the [Camunda Design System](https://github.com/camunda/design-system) (C4).

It works by re-pointing the [`@bpmn-io/theme`](../theme) semantic tokens at C4
tokens, so one import themes every bpmn.io component at once. Colour always
comes from C4; the structure it implies — radii, spacing, control heights, ghost
buttons — follows the [shadcn/ui](https://ui.shadcn.com/) conventions C4 is
built on.

## Usage

Put `.c4-ui` on your application root (it carries the design system's tokens),
load the base component CSS, then the shared tokens and the adapter for each
component in use. The theme is scoped to `.c4-ui`, so importing the stylesheet
is the only opt-in:

```html
<body class="c4-ui">
  <div id="canvas"></div>
  <div id="properties-panel"></div>
</body>
```

```js
import '@camunda/design-system/styles.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import '@bpmn-io/c4-theme/assets/tokens.css';
import '@bpmn-io/c4-theme/assets/properties-panel.css';
```

Each adapter loads after the base CSS of the component it themes. To also theme
the diagram surfaces — the palette, the search pad and the popup editor (the
create, append and replace menus) — load `diagram.css` after the bpmn-js
stylesheets:

```js
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import '@bpmn-io/c4-theme/assets/tokens.css';
import '@bpmn-io/c4-theme/assets/diagram.css';
```

Dark mode follows the design system's own `dark` class — the theme carries no
palette of its own, so it inherits whatever C4 resolves to.

## Build and Run

Prepare the project by installing all dependencies:

```sh
npm install
```

Then, depending on your use-case, you may run any of the following commands:

```sh
# lint and run all tests
npm run all

# run all tests
npm test

# spin up the canonical playground to try the theme end-to-end
npm start

# capture side-by-side theme comparison screenshots into .captures/
npm run capture
```

To explore a narrower surface, `it.only` a scenario spec or spin up one of the
component-specific playgrounds:

```sh
npm run start:properties-panel
npm run start:diagram
npm run start:bpmn
npm run start:element-template-chooser
```

## License

MIT