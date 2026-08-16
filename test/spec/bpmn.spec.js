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

  it('should expose drilldown icons and breadcrumbs', async function() {
    playground = await createPlayground(this, 'bpmn');

    // when
    playground.setup.drilldown();

    // then
    expect(playground.root.querySelector('.bjs-breadcrumbs')).to.exist;
  });
});
