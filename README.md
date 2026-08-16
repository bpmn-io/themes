# bpmn.io Shadcn Theme

A portable [shadcn/ui](https://ui.shadcn.com/) theme for bpmn.io, with an
optional [Camunda Design System](https://github.com/camunda/design-system) (C4)
override.

## Usage

Apply `bpmn-io-shadcn-theme` to a common ancestor, load the base component CSS,
then the shared tokens and the adapter for each component in use:

```html
<div class="bpmn-io-shadcn-theme">
  <div id="properties-panel"></div>
</div>
```

```js
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import '@bpmn-io/shadcn-theme/assets/tokens.css';
import '@bpmn-io/shadcn-theme/assets/properties-panel.css';
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
import '@bpmn-io/shadcn-theme/assets/c4.css';
```

## Build and Run

The test suite doubles as live playgrounds backed by the released component
packages: in start mode each scenario stays mounted and the fixed **Theme**
switcher (persisted as `?theme=`) flips it between Original, Shadcn, and C4.

Prepare the project by installing all dependencies:

```sh
npm install
```

Then, depending on your use-case, run any of the following commands:

```sh
# lint and run all tests
npm run all

# spin up a playground for a component
npm run start:properties-panel
npm run start:diagram
npm run start:bpmn
npm run start:element-template-chooser
```

## License

MIT
