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

  it('should theme the palette', async function() {
    playground = await createPlayground(this, 'diagram-palette');

    const palette = playground.root.querySelector('.djs-palette');

    // then
    expect(palette).to.exist;
    expect(getComputedStyle(palette).getPropertyValue('--palette-background-color'))
      .to.equal('hsl(0 0% 100%)');
  });

  it('should theme the search pad', async function() {
    playground = await createPlayground(this, 'diagram-search');

    // when
    playground.setup.search('Review');

    await playground.setup.settle();

    const container = playground.root.querySelector('.djs-search-container');

    // then
    expect(container).to.exist;
    expect([ ...container.classList ]).to.include('open');
    expect(playground.root.querySelectorAll('.djs-search-result').length).to.be.above(0);
  });

  it('should theme the replace popup', async function() {
    playground = await createPlayground(this, 'diagram-replace');

    // when
    playground.setup.replace();

    // then
    const popup = playground.root.querySelector('.djs-popup-parent[data-popup="bpmn-replace"]');

    expect(popup).to.exist;
    expect(popup.querySelector('.djs-popup-body .entry')).to.exist;
  });

  it('should theme the create popup', async function() {
    playground = await createPlayground(this, 'diagram-create');

    // when
    playground.setup.create();

    // then
    const popup = playground.root.querySelector('.djs-popup-parent[data-popup="bpmn-create"]');

    expect(popup).to.exist;
    expect(popup.querySelector('.djs-popup-search input')).to.exist;
    expect(getComputedStyle(popup).getPropertyValue('--bpmn-create-popup-width')).to.equal('360px');
  });

  it('should theme the append popup', async function() {
    playground = await createPlayground(this, 'diagram-append');

    // when
    playground.setup.append();

    // then
    const popup = playground.root.querySelector('.djs-popup-parent[data-popup="bpmn-append"]');

    expect(popup).to.exist;
    expect(popup.querySelector('.djs-popup-tabs, .djs-popup-body .entry')).to.exist;
  });
});
