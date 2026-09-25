import { expect } from 'chai';

import { createRpaPlayground } from '../RpaTestHelper.js';

import {
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

/**
 * The RPA editor renders its own container plus a set of properties panel
 * groups inside the host panel. It carries no C4 adapter: it is expected to
 * follow the theme through the `--bio-*` tokens alone.
 */
describe('rpa playground', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('rpa')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });


  it('should scope the theme on the editor container', async function() {

    // given
    playground = await createRpaPlayground(this, 'rpa-editor');

    // when
    const container = playground.root.querySelector('.crpa-rpa-container');

    // then
    expect(container, 'the editor mounts its own container').to.exist;
    expect([ ...container.classList ]).to.include('bio-theme-parent');
  });


  it('should reach the editor with the tokens', async function() {

    // given
    playground = await createRpaPlayground(this, 'rpa-editor');

    const container = playground.root.querySelector('.crpa-rpa-container');

    // when
    const surface = getComputedStyle(container)
      .getPropertyValue('--bio-surface-medium')
      .trim();

    // then
    expect(surface, 'tokens must reach the editor').to.not.equal('');
  });

});
