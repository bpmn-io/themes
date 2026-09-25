import { RPAEditor } from '@camunda/rpa-integration';

import TestContainer from 'mocha-test-container-support';

import {
  applyTheme,
  insertStyles,
  moveImportedStylesLast,
  shouldKeepPlayground
} from './TestHelper.js';

import defaultRpaScript from './fixtures/script.rpa.json';

/*
 * The RPA editor bundles Monaco, which triples the size of the test bundle.
 * karma-webpack merges every module into a single chunk and ignores custom
 * `optimization` settings, so a dynamic import does not help -- keeping this in
 * its own module is what lets `testBundle.js` leave it out of the other
 * playgrounds.
 */

/**
 * Mount the RPA editor with its properties panel, the way the Modeler embeds
 * it: the editor renders into one container and the panel groups into another,
 * inside the host's properties panel.
 *
 * @param {object} context mocha context
 * @param {string} name scenario name, used as the capture key
 * @param {object} [options]
 * @param {object} [options.script] RPA script to open (defaults to the fixture)
 */
export async function createRpaPlayground(context, name, options = {}) {
  insertStyles();
  moveImportedStylesLast();

  const { script = defaultRpaScript } = options;

  const root = document.createElement('div');
  root.className = 'playground playground--rpa';
  root.dataset.playground = name;
  root.innerHTML = `
    <div class="playground-main">
      <div class="playground-rpa-editor"></div>
      <div class="playground-properties bio-properties-panel"></div>
    </div>
  `;

  TestContainer.get(context).appendChild(root);
  applyTheme();

  const editor = RPAEditor({
    container: root.querySelector('.playground-rpa-editor'),
    propertiesPanel: {
      container: root.querySelector('.playground-properties')
    },
    value: JSON.parse(JSON.stringify(script))
  });

  const setup = {
    settle: async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  };

  await setup.settle();

  const playground = {
    root,
    editor,
    setup,
    destroy() {
      editor.destroy();
      root.remove();
    }
  };

  if (shouldKeepPlayground()) {
    const registry = window.__playgrounds__ || (window.__playgrounds__ = {});

    registry[name] = playground;
  }

  return playground;
}
