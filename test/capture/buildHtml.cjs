const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

/*
 * The full stylesheet stack, in the same order the live playground loads it
 * (see test/TestHelper.js `insertStyles`). Keep in sync — a missing sheet here
 * renders scenarios unfaithfully (e.g. dropping element-templates styling).
 */
const STYLESHEETS = [
  'node_modules/@camunda/design-system/dist/styles.css',
  'node_modules/diagram-js/assets/diagram-js.css',
  'node_modules/bpmn-js/dist/assets/bpmn-js.css',
  'node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css',
  'node_modules/@bpmn-io/form-js/dist/assets/form-js.css',
  'node_modules/@bpmn-io/form-js/dist/assets/form-js-editor.css',
  'node_modules/@bpmn-io/form-js/dist/assets/form-js-playground.css',
  'node_modules/@bpmn-io/properties-panel/dist/assets/properties-panel.css',
  'packages/theme/assets/theme.css',
  'node_modules/bpmn-js-element-templates/dist/assets/element-templates.css',
  'node_modules/camunda-bpmn-js/styles/popup-menu.css',
  'node_modules/@bpmn-io/element-template-chooser/dist/element-template-chooser.css',
  'packages/c4-theme/assets/tokens.css',
  'packages/c4-theme/assets/properties-panel.css',
  'packages/c4-theme/assets/diagram.css',
  'packages/c4-theme/assets/form-js.css',
  'test/playground.css'
];

/**
 * The themes a captured scenario is rendered under for comparison.
 */
const THEMES = [
  { name: 'bpmn-io', label: 'bpmn-io', themed: false, dark: false },
  { name: 'c4-light', label: 'C4 — light', themed: true, dark: false },
  { name: 'c4-dark', label: 'C4 — dark', themed: true, dark: true }
];

const PANEL_WIDTH = 360;

function read(rel) {
  let css = fs.readFileSync(path.join(ROOT, rel), 'utf8');

  // resolve the design-system's relative font files so Geist loads standalone
  if (rel.includes('@camunda/design-system')) {
    const filesDir = path.join(ROOT, 'node_modules/@camunda/design-system/dist/files');

    css = css.replaceAll('url(./files/', `url(file://${filesDir}/`);
  }

  return css;
}

function styles() {
  return STYLESHEETS.map(read).map(css => `<style>${css}</style>`).join('\n');
}

function cell(theme, capture) {
  const rootClasses = [ 'playground' ];

  if (theme.dark) {
    rootClasses.push('dark');
  }

  // the grid shows several themes at once, so each cell scopes its own instead
  // of using the app root a consumer would theme; the theme needs `.c4-ui` above
  const figureClasses = [ 'capture-cell', theme.dark ? 'dark' : 'light' ];

  if (theme.themed) {
    figureClasses.push('c4-ui');
  }

  // diagram scenarios ship their canvas surfaces instead of a panel
  if (capture.diagram) {
    rootClasses.push('capture-cell-canvas');

    // the backdrop carries both container classes because that is where each
    // library declares its variables (`.djs-parent`, `.bjs-container`), and
    // `bjs-breadcrumbs-shown` because the trail is display:none without it
    return `<figure class="${figureClasses.join(' ')}">
    <figcaption>${theme.label}</figcaption>
    <div class="${rootClasses.join(' ')}">
      <div class="djs-container djs-parent bjs-container bjs-breadcrumbs-shown bio-theme-parent capture-surfaces">${capture.diagram.join('\n')}</div>
    </div>
  </figure>`;
  }

  // form scenarios ship the rendered viewer form or the whole editor
  if (capture.form) {
    rootClasses.push('capture-cell-form', `capture-cell-form--${capture.formVariant}`);

    return `<figure class="${figureClasses.join(' ')}">
    <figcaption>${theme.label}</figcaption>
    <div class="${rootClasses.join(' ')}">
      <div class="playground-form playground-form--${capture.formVariant}">${capture.form}</div>
    </div>
  </figure>`;
  }

  const { panel, overlays } = capture;

  rootClasses.push('capture-cell-panel');

  const overlayHtml = overlays && overlays.length
    ? `<div class="capture-overlays bio-properties-panel bio-theme-parent">${overlays.join('\n')}</div>`
    : '';

  return `<figure class="${figureClasses.join(' ')}">
    <figcaption>${theme.label}</figcaption>
    <div class="${rootClasses.join(' ')}">
      <div class="playground-properties" style="width: ${PANEL_WIDTH}px;">${panel}</div>
      ${overlayHtml}
    </div>
  </figure>`;
}

/**
 * Render a single, self-contained comparison document for one scenario: the same
 * captured markup shown side by side under every theme, under a heading.
 *
 * A screenshot of this page is the one comparison image per scenario.
 *
 * @param {string} name scenario name
 * @param {{ panel: string, overlays: string[], runtimeStyles: string[] }} capture
 * captured panel markup plus any portaled overlays (feel/text popup, tooltip),
 * stacked below the panel, and CodeMirror's runtime-injected stylesheets
 *
 * @return {string}
 */
function buildComparisonHtml(name, capture) {
  const cells = THEMES.map(theme => cell(theme, capture)).join('\n');

  // CodeMirror's runtime-injected rules (layout + syntax highlighting), captured
  // from the live document. They go before the static sheet stack so the theme's
  // higher-specificity .cm-* overrides still win, mirroring the live cascade.
  const runtimeStyles = (capture.runtimeStyles || [])
    .map(css => `<style>${css}</style>`)
    .join('\n');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${name}</title>
${runtimeStyles}
${styles()}
<style>
  html, body { margin: 0; padding: 0; }
  body {
    padding: 24px;
    background: #e4e4e7;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    width: max-content;
  }
  h1 { font-size: 20px; margin: 0 0 16px; color: #18181b; }
  .capture-row { display: flex; gap: 16px; align-items: flex-start; }
  .capture-cell { margin: 0; }
  .capture-cell figcaption {
    font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #3f3f46;
  }
  .capture-cell-panel {
    width: max-content;
    min-width: ${PANEL_WIDTH}px;
    border: 1px solid rgba(0, 0, 0, .12);
    background: #ffffff;
  }
  .capture-cell.dark .capture-cell-panel { border-color: #27272a; background: #18181b; }
  .capture-cell-panel .bio-properties-panel { height: auto; }

  /*
   * Diagram scenarios: the palette, search pad and popup menu mount inside the
   * canvas and position themselves against the live viewport. In the static
   * export we drop them onto a canvas-tinted backdrop and neutralise their
   * positioning so they stack, mirroring the panel overlays.
   */
  .capture-cell-canvas {
    box-sizing: border-box;
    width: max-content;
    min-width: 520px;
    border: 1px solid rgba(0, 0, 0, .12);
    background: #f4f4f5;
  }
  .capture-cell.dark .capture-cell-canvas { border-color: #27272a; background: #18181b; }
  .capture-surfaces {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
    min-height: 160px;
  }
  .capture-surfaces .djs-palette,
  .capture-surfaces .djs-search-container,
  .capture-surfaces .djs-popup-parent,
  .capture-surfaces .djs-popup,
  .capture-surfaces .bjs-breadcrumbs,
  .capture-surfaces .bjs-drilldown {
    position: static !important;
    inset: auto !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    margin: 0 !important;
  }
  .capture-surfaces .djs-popup-parent { width: max-content; }
  /* the search pad floats centrally above the canvas — mirror that placement */
  .capture-surfaces .djs-search-container {
    align-self: center;
    width: 340px;
  }

  /*
   * Form scenarios: the viewer renders a single form column; the editor renders
   * its full three-part layout (palette / form / properties). Give each a fixed
   * frame so the export mirrors the live playground.
   */
  .capture-cell-form {
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, .12);
    background: #ffffff;
  }
  .capture-cell.dark .capture-cell-form { border-color: #27272a; background: #18181b; }
  .capture-cell-form--viewer { width: 420px; }
  .capture-cell-form--viewer .playground-form--viewer { padding: 24px; }
  .capture-cell-form--editor { width: 960px; }
  .capture-cell-form--editor .fjs-editor-container,
  .capture-cell-form--editor .playground-form--editor { height: 640px; }

  /*
   * Portaled overlays position themselves against the live viewport. In the
   * static export we stack them below the panel instead, so strip the
   * positioning (the .playground rules use !important, hence the specificity).
   * The wrapper carries the bio-properties-panel class purely for its CSS
   * variable scope (the vendor --color-* tokens) so overlays lifted out of the
   * panel keep their theming; its panel layout is reset here.
   */
  .capture-overlays {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    border-top: 1px dashed rgba(0, 0, 0, .12);
  }
  .capture-overlays.bio-properties-panel {
    position: static;
    flex: none;
    width: auto;
    height: auto;
    overflow: visible;
  }
  .capture-cell.dark .capture-overlays { border-top-color: #3f3f46; }
  .playground .capture-overlays > *,
  .playground .capture-overlays .bio-properties-panel-popup,
  .playground .capture-overlays .bio-properties-panel-tooltip {
    position: static !important;
    inset: auto !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    margin: 0 !important;
    max-width: 520px !important;
    max-height: none !important;
  }
</style>
</head>
<body>
  <h1>${name}</h1>
  <div class="capture-row">${cells}</div>
</body></html>`;
}

/**
 * Build a comparison index embedding every scenario's comparison page.
 *
 * @param {string[]} names
 *
 * @return {string}
 */
function buildIndex(names) {
  const sections = names.map(name =>
    `<section>
      <h2>${name}</h2>
      <iframe src="./${name}/comparison.html" title="${name}" loading="lazy"></iframe>
    </section>`
  ).join('\n');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>theme comparison captures</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 24px; background: #fafafa; }
  h1 { font-size: 24px; }
  h2 { margin: 32px 0 8px; font-size: 16px; }
  iframe { width: 100%; height: 900px; border: 1px solid #ddd; background: #e4e4e7; }
</style></head><body>
<h1>Theme comparison captures</h1>
${sections}
</body></html>`;
}

module.exports = {
  THEMES,
  buildComparisonHtml,
  buildIndex
};
