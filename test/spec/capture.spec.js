/*
 * Capture hook (opt-in via the CAPTURE env, set by the capture karma config).
 *
 * The specs are the single source of truth for scenarios. In retained mode
 * (SINGLE_START=all) each spec leaves its playground mounted, so this root-level
 * `after` hook walks every mounted playground and emits its rendered panel plus
 * any portaled overlays as a `CAPTURE::<name>::<base64>` log line. The `capture`
 * karma reporter persists those to disk. During a normal `npm test` run CAPTURE
 * is unset and this is a no-op.
 *
 * Select scenarios with mocha's own `--grep` (forwarded by scripts/capture.js).
 */

// eslint-disable-next-line mocha/no-top-level-hooks
after(function() {
  const env = window.__env__ || {};

  if (!env.CAPTURE) {
    return;
  }

  const seen = new Set();

  // CodeMirror builds its layout and syntax-highlight rules at runtime and
  // injects them as <style> elements in the document head (never in any
  // node_modules sheet). The static clone keeps the generated token classes but
  // not those rules, so without this the exported editors collapse to an
  // unstyled, uncoloured block. Carry the CM stylesheets along with the markup.
  const CM_STYLE_RE = /\.cm-|\u037c/;

  /*
   * Canvas scenarios compare diagram surfaces rather than the properties panel.
   * Each names the surfaces it exercises, so a scenario ships the one thing it
   * is about instead of whatever happens to be mounted.
   */
  const CANVAS_SURFACES = {
    'diagram-palette': [ '.djs-palette' ],
    'diagram-search': [ '.djs-search-container.open', '.djs-palette' ],
    'diagram-replace': [ '.djs-popup-parent' ],
    'diagram-create': [ '.djs-popup-parent' ],
    'diagram-append': [ '.djs-popup-parent' ],
    'bpmn-drilldown': [ '.bjs-drilldown' ],
    'bpmn-breadcrumbs': [ '.bjs-breadcrumbs' ]
  };

  /*
   * The search pad and the popup menus all close on any outside click, which
   * mounting and interacting with later scenarios triggers, so re-run the
   * interaction here to capture them in their open state.
   */
  const REOPEN = {
    'diagram-search': (setup) => setup.search('Review'),
    'diagram-replace': (setup) => setup.replace(),
    'diagram-create': (setup) => setup.create(),
    'diagram-append': (setup) => setup.append()
  };

  const runtimeStyles = Array.from(document.querySelectorAll('style'))
    .map((el) => el.textContent || '')
    .filter((css) => CM_STYLE_RE.test(css));

  // CodeMirror also lays itself out at runtime — the editor fills its container,
  // the scroller and gutter take their height from it, content flows — and none
  // of that survives as static CSS. Copy the live pixel height of every editor
  // element onto the detached clone so the export matches what the browser
  // actually rendered (full-height gutter, editor filling the popup body).
  const GEO_SELECTOR =
    '.cm-editor, .cm-scroller, .cm-gutters, .cm-gutter, .cm-content';

  function bakeGeometry(liveRoot, cloneRoot) {
    const live = liveRoot.querySelectorAll(GEO_SELECTOR);
    const clone = cloneRoot.querySelectorAll(GEO_SELECTOR);

    live.forEach((el, i) => {
      const target = clone[i];

      if (!target) {
        return;
      }

      const height = Math.round(el.getBoundingClientRect().height);

      if (height) {
        target.style.height = `${height}px`;
      }
    });
  }

  document.querySelectorAll('.playground[data-playground]').forEach((root) => {
    const name = root.dataset.playground;

    if (seen.has(name)) {
      return;
    }

    // Canvas scenarios compare the canvas surfaces (palette, search pad, popup
    // menu, drilldown) rather than the properties panel. They all mount inside
    // the themed canvas container, so capture the ones this scenario declares
    // and let the exporter re-home them onto a canvas backdrop.
    const surfaceSelectors = CANVAS_SURFACES[name];

    if (surfaceSelectors) {
      const canvas = root.querySelector('.playground-canvas');

      const playground = (window.__playgrounds__ || {})[name];
      const reopen = REOPEN[name];

      if (playground && reopen) {
        reopen(playground.setup);
      }

      const surfaces = [];

      surfaceSelectors.forEach((selector) => {
        canvas.querySelectorAll(selector).forEach((el) => surfaces.push(el));
      });

      if (!surfaces.length) {
        return;
      }

      seen.add(name);

      const diagram = surfaces.map((el) => el.outerHTML);

      const payload = JSON.stringify({ diagram, runtimeStyles });

      const encoded = btoa(unescape(encodeURIComponent(payload)));

      console.log(`CAPTURE::${name}::${encoded}`);

      return;
    }

    // Form scenarios ship the rendered viewer form or the editor (with its own
    // palette / properties layout), which mounts inside `.playground-form`.
    if (name.startsWith('form')) {
      const surface = root.querySelector('.playground-form');

      if (!surface || !surface.innerHTML.trim()) {
        return;
      }

      seen.add(name);

      const clone = surface.cloneNode(true);

      bakeGeometry(surface, clone);

      const payload = JSON.stringify({
        form: clone.innerHTML,
        formVariant: root.dataset.formVariant || 'viewer',
        runtimeStyles
      });

      const encoded = btoa(unescape(encodeURIComponent(payload)));

      console.log(`CAPTURE::${name}::${encoded}`);

      return;
    }

    const panel = root.querySelector('.playground-properties');

    if (!panel || !panel.innerHTML.trim()) {
      return;
    }

    seen.add(name);

    // Overlays position themselves against the live viewport, so they don't
    // re-render faithfully inline. Collect them and let the exporter stack them
    // below the panel instead: portaled popups mount into the scenario root
    // (next to `.playground-main`), while the tooltip floats inside the panel.
    const panelClone = panel.cloneNode(true);

    bakeGeometry(panel, panelClone);

    const overlays = Array.from(root.children)
      .filter((el) => !el.classList.contains('playground-main'))
      .map((el) => {
        const clone = el.cloneNode(true);

        bakeGeometry(el, clone);

        return clone.outerHTML;
      });

    panelClone.querySelectorAll('.bio-properties-panel-tooltip').forEach((tooltip) => {
      overlays.push(tooltip.outerHTML);
      tooltip.remove();
    });

    const payload = JSON.stringify({ panel: panelClone.innerHTML, overlays, runtimeStyles });

    const encoded = btoa(unescape(encodeURIComponent(payload)));

    console.log(`CAPTURE::${name}::${encoded}`);
  });
});
