import { expect } from 'chai';

import {
  createPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('diagram-js playground', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('diagram')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should expose palette, search and popup surfaces', async function() {
    playground = await createPlayground(this, 'diagram');

    // when
    playground.setup.search();

    const canvas = playground.root.querySelector('.playground-canvas');
    const svg = canvas.querySelector('svg');
    svg.setAttribute('tabindex', '0');
    svg.focus();

    // then
    expect(playground.root.querySelector('.djs-palette')).to.exist;
    expect(playground.root.querySelector('.djs-search-container')).to.exist;
    expect(document.activeElement).to.equal(svg);
    expect(getComputedStyle(svg).getPropertyValue('border-radius')).to.equal('0px');
    expect(getComputedStyle(svg).getPropertyValue('outline-offset')).to.equal('-2px');
  });
});
