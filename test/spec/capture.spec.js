/*
 * Capture hook (opt-in via the CAPTURE env, set by the capture karma config).
 *
 * The specs are the single source of truth for scenarios. In retained mode
 * (SINGLE_START=all) each spec leaves its playground mounted, so this root-level
 * `after` hook walks every mounted playground and emits its rendered panel as a
 * `CAPTURE::<name>::<base64>` log line. The `capture` karma reporter persists
 * those to disk. During a normal `npm test` run CAPTURE is unset and this is a
 * no-op.
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

    const encoded = btoa(unescape(encodeURIComponent(panel.innerHTML)));

    console.log(`CAPTURE::${name}::${encoded}`);
  });
});
