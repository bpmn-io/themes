import { expect } from 'chai';

import {
  createPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('bpmn-js playground', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('bpmn')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should theme the drilldown control', async function() {
    playground = await createPlayground(this, 'bpmn-drilldown');

    const drilldown = playground.root.querySelector('.bjs-drilldown');
    const canvas = playground.root.querySelector('.djs-parent');

    // then
    expect(drilldown).to.exist;
    expect(getComputedStyle(canvas).getPropertyValue('--drilldown-background-color'))
      .to.equal('hsl(240 5.9% 10%)');
    expect(getComputedStyle(canvas).getPropertyValue('--drilldown-fill-color'))
      .to.equal('hsl(0 0% 98%)');

    // then
    // the focus ring is themed via the upstream token (deterministic across
    // browsers; the rendered :focus-visible outline is not, as Firefox only
    // matches it on keyboard-driven focus)
    expect(getComputedStyle(canvas).getPropertyValue('--drilldown-focus-outline-color'))
      .to.equal('hsl(240 10% 3.9%)');
  });

  it('should theme drilldown breadcrumbs', async function() {
    playground = await createPlayground(this, 'bpmn-breadcrumbs');

    // when
    playground.setup.drilldown();

    // then
    expect(playground.root.querySelector('.bjs-breadcrumbs')).to.exist;
    expect(getComputedStyle(playground.root.querySelector('.djs-parent'))
      .getPropertyValue('--breadcrumbs-item-color')).to.equal('hsl(240 5.9% 10%)');
  });
});
