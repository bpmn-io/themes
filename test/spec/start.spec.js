import {
  createBpmnPlayground,
  isStartOnly
} from '../TestHelper.js';

/*
 * Canonical end-to-end playground.
 *
 * A single bpmn-js editor with the properties panel and the theme(s) applied,
 * meant for humans to try the whole customization together, live, via
 * `npm start`. The palette, the diagram search pad, the popup editor (the
 * create, append and replace menus) and the minimap are wired in too, so every
 * themed surface is reachable from one editor. Use the global theme switcher
 * (bpmn-io / C4) to flip between themes without reloading.
 *
 * This is exploration-only, so it is skipped during `npm test` (which runs the
 * real suite) and only mounts when started explicitly with SINGLE_START=start.
 * To explore a narrower surface instead, run one of the `npm run start:*`
 * scripts or `it.only` a specific scenario spec.
 */
describe('theme playground', function() {

  before(function() {
    if (!isStartOnly('start')) {
      this.skip();
    }
  });

  it('renders the full editor with the theme applied', async function() {
    const playground = await createBpmnPlayground(this, 'start', {
      exampleData: true,
      themeControls: true,
      minimap: true
    });

    // the minimap mounts collapsed, so open it to expose the themed surface
    playground.setup.minimap();
  });
});
