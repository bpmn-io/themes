import { expect } from 'chai';

import {
  createBpmnPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('improved-canvas playground', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('improved-canvas')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should theme the context pad', async function() {
    playground = await createBpmnPlayground(this, 'improved-canvas', { improvedCanvas: true });

    const contextPad = playground.root.querySelector('.djs-context-pad');

    // then
    expect(contextPad).to.exist;

    const style = getComputedStyle(contextPad);

    expect(style.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
    expect(style.borderTopLeftRadius).to.not.equal('0px');
  });


  it('should fill the append indicator', async function() {
    playground = await createBpmnPlayground(this, 'improved-canvas-append', { improvedCanvas: true });

    const indicator = playground.root.querySelector('.djs-append-indicator');

    // then
    expect(indicator).to.exist;

    // a transparent fill leaves the indicator invisible against the canvas
    expect(getComputedStyle(indicator).backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
  });


  it('should use the canvas accent for the call to action', async function() {
    playground = await createBpmnPlayground(this, 'improved-canvas', { improvedCanvas: true });

    const canvas = playground.root.querySelector('.bio-improved-canvas');

    // then
    const style = getComputedStyle(canvas);

    expect(style.getPropertyValue('--context-pad-entry-call-to-action-background-color'))
      .to.equal(style.getPropertyValue('--bio-canvas-accent'));
  });
});
