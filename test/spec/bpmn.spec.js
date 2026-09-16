import { expect } from 'chai';

import {
  createBpmnPlayground,
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
    playground = await createBpmnPlayground(this, 'bpmn-drilldown');

    const drilldown = playground.root.querySelector('.bjs-drilldown');
    const canvas = playground.root.querySelector('.djs-parent');

    // then
    expect(drilldown).to.exist;

    const canvasStyle = getComputedStyle(canvas);

    expect(canvasStyle.getPropertyValue('--drilldown-background-color'))
      .to.equal(canvasStyle.getPropertyValue('--primary-action-default'));
    expect(canvasStyle.getPropertyValue('--drilldown-fill-color'))
      .to.equal(canvasStyle.getPropertyValue('--primary-action-foreground'));

    // asserted once bpmn-js ships its token support; the published version does
    // not read `--bio-*`, so the focus binding is inert against it
    //
    // drilldown.focus();
    // await playground.setup.settle();
    // expect(getComputedStyle(drilldown).outlineColor).to.equal('rgb(9, 9, 11)');
  });

  it('should theme drilldown breadcrumbs', async function() {
    playground = await createBpmnPlayground(this, 'bpmn-breadcrumbs');

    // when
    playground.setup.drilldown();

    // then
    expect(playground.root.querySelector('.bjs-breadcrumbs')).to.exist;

    const canvasStyle = getComputedStyle(playground.root.querySelector('.djs-parent'));

    expect(canvasStyle.getPropertyValue('--breadcrumbs-item-color'))
      .to.equal(canvasStyle.getPropertyValue('--primary-action-default'));
  });
});
