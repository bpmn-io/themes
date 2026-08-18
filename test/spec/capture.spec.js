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
