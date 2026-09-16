import { expect } from 'chai';

import {
  createBpmnPlayground,
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
    playground = await createBpmnPlayground(this, 'diagram-palette');

    const palette = playground.root.querySelector('.djs-palette');

    // then
    expect(palette).to.exist;

    const paletteStyle = getComputedStyle(palette);

    expect(paletteStyle.getPropertyValue('--palette-background-color'))
      .to.equal(paletteStyle.getPropertyValue('--background'));

    // selection keeps the conventional editor blue, distinct from the black
    // element strokes it wraps, rather than the dark foreground/ring; asserted
    // once diagram-js ships its token support, as the published version is inert
    //
    // const canvas = playground.root.querySelector('.djs-parent');
    //
    // expect(getComputedStyle(canvas).getPropertyValue('--element-selected-outline-stroke-color'))
    //   .to.equal('hsl(205, 100%, 40%)');
  });

  it('should theme the search pad', async function() {
    playground = await createBpmnPlayground(this, 'diagram-search');

    // when
    playground.setup.search('Review');

    await playground.setup.settle();

    const container = playground.root.querySelector('.djs-search-container');

    // then
    expect(container).to.exist;
    expect([ ...container.classList ]).to.include('open');
    expect(playground.root.querySelectorAll('.djs-search-result').length).to.be.above(0);

    // the matched element is preselected and highlighted on-canvas by filling
    // its (now selected, visible) outline; the fill must stay translucent so
    // the element's own label is not painted over (regression guard)
    const outline = playground.root.querySelector('.djs-element.selected .djs-outline');

    expect(outline).to.exist;

    // `color-mix()` computes to `color(srgb r g b / a)`, plain colours to `rgba()`
    const fill = getComputedStyle(outline).fill;
    const alpha = parseFloat((fill.match(/\/\s*([\d.]+)\s*\)/) || fill.match(/rgba\([^)]+,\s*([\d.]+)\s*\)/) || [ '', '1' ])[1]);

    expect(alpha, `preselected outline fill "${fill}" must be translucent`).to.be.below(1);
  });

  it('should theme the replace popup', async function() {
    playground = await createBpmnPlayground(this, 'diagram-replace');

    // when
    playground.setup.replace();

    // then
    const popup = playground.root.querySelector('.djs-popup-parent[data-popup="bpmn-replace"]');

    expect(popup).to.exist;
    expect(popup.querySelector('.djs-popup-body .entry')).to.exist;
  });

  it('should theme the create popup', async function() {
    playground = await createBpmnPlayground(this, 'diagram-create');

    // when
    playground.setup.create();

    // then
    const popup = playground.root.querySelector('.djs-popup-parent[data-popup="bpmn-create"]');

    expect(popup).to.exist;
    expect(popup.querySelector('.djs-popup-search input')).to.exist;
    expect(getComputedStyle(popup).getPropertyValue('--bpmn-create-popup-width')).to.equal('360px');
  });

  it('should theme the append popup', async function() {
    playground = await createBpmnPlayground(this, 'diagram-append');

    // when
    playground.setup.append();

    // then
    const popup = playground.root.querySelector('.djs-popup-parent[data-popup="bpmn-append"]');

    expect(popup).to.exist;
    expect(popup.querySelector('.djs-popup-tabs, .djs-popup-body .entry')).to.exist;
  });
});
