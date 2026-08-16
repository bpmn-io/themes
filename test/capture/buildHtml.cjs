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
  'node_modules/bpmn-js/dist/assets/diagram-js.css',
  'node_modules/bpmn-js/dist/assets/bpmn-js.css',
  'node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css',
  'node_modules/@bpmn-io/properties-panel/dist/assets/properties-panel.css',
  'node_modules/bpmn-js-element-templates/dist/assets/element-templates.css',
  'node_modules/@bpmn-io/element-template-chooser/dist/element-template-chooser.css',
  'assets/tokens.css',
  'assets/properties-panel.css',
  'assets/c4.css',
  'test/playground.css'
];

/**
 * The themes a captured scenario is rendered under for comparison.
 */
const THEMES = [
  { name: 'original', label: 'Original', shadcn: false, dark: false },
  { name: 'shadcn-light', label: 'shadcn — light', shadcn: true, dark: false },
  { name: 'shadcn-dark', label: 'shadcn — dark', shadcn: true, dark: true }
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

function cell(theme, panelHtml) {
  const rootClasses = [ 'playground', 'capture-cell-panel' ];

  if (theme.shadcn) {
    rootClasses.push('bpmn-io-shadcn-theme');
  }

  if (theme.dark) {
    rootClasses.push('dark');
  }

  return `<figure class="capture-cell ${theme.dark ? 'dark' : 'light'}">
    <figcaption>${theme.label}</figcaption>
    <div class="${rootClasses.join(' ')}">
      <div class="playground-properties" style="width: ${PANEL_WIDTH}px;">${panelHtml}</div>
    </div>
  </figure>`;
}

/**
 * Render a single, self-contained comparison document for one scenario: the same
 * captured panel markup shown side by side under every theme, under a heading.
 *
 * A screenshot of this page is the one comparison image per scenario.
 *
 * @param {string} name scenario name
 * @param {string} panelHtml captured `.playground-properties` markup
 *
 * @return {string}
 */
function buildComparisonHtml(name, panelHtml) {
  const cells = THEMES.map(theme => cell(theme, panelHtml)).join('\n');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${name}</title>
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
    width: ${PANEL_WIDTH}px;
    border: 1px solid rgba(0, 0, 0, .12);
    background: #ffffff;
  }
  .capture-cell.dark .capture-cell-panel { border-color: #27272a; background: #18181b; }
  .capture-cell-panel .bio-properties-panel { height: auto; }
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
