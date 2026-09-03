# bpmn.io Shadcn Theme

[![CI](https://github.com/bpmn-io/themes/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/themes/actions/workflows/CI.yml)

A portable [shadcn/ui](https://ui.shadcn.com/) theme for bpmn.io, with an
optional [Camunda Design System](https://github.com/camunda/design-system) (C4)
override.

It works by re-pointing the [`@bpmn-io/theme`](../theme) semantic tokens at
shadcn values, so one import themes every bpmn.io component at once.

## Usage

Apply `bpmn-io-shadcn-theme` to your application root, load the base component CSS,
then the shared tokens and the adapter for each component in use:

```html
<body class="bpmn-io-shadcn-theme">
  <div id="canvas"></div>
  <div id="properties-panel"></div>
</body>
```

```js
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import '@bpmn-io/shadcn-theme/assets/tokens.css';
import '@bpmn-io/shadcn-theme/assets/properties-panel.css';
```

Each adapter loads after the base CSS of the component it themes. To also theme
the diagram surfaces — the palette, the search pad and the popup editor (the
create, append and replace menus) — load `diagram.css` after the bpmn-js
stylesheets:

```js
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import '@bpmn-io/shadcn-theme/assets/tokens.css';
import '@bpmn-io/shadcn-theme/assets/diagram.css';
```

Add `dark` to the theme root (or any ancestor) for dark mode, and override the
`--shadcn-*` properties to match your shadcn configuration:

```css
.bpmn-io-shadcn-theme {
  --shadcn-primary: 221.2 83.2% 53.3%;
  --shadcn-radius: 0.75rem;
}
```

### Camunda Design System (C4) override

C4 exposes its own scoped semantic tokens. Render inside `C4Provider` and import
`c4.css` after the adapter; it only applies beneath `.c4-ui`, leaving stock
shadcn consumers unaffected:

```js
import '@camunda/design-system/styles.css';
import '@bpmn-io/shadcn-theme/assets/tokens.css';
import '@bpmn-io/shadcn-theme/assets/properties-panel.css';
import '@bpmn-io/shadcn-theme/assets/diagram.css';
import '@bpmn-io/shadcn-theme/assets/c4.css';
```

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