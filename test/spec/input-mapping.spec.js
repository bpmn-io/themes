import { expect } from 'chai';

import {
  createBpmnPlayground,
  isPlaygroundEnabled,
  manyInputsDiagram,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('input mapping', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('input-mapping')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should render a prominent count for collapsed input mappings', async function() {
    const scenario = await createCollapsedInputMapping(this, 'input-mapping');
    playground = scenario.playground;

    const {
      badge,
      group,
      list
    } = scenario;

    // then
    expect(badge.textContent).to.equal('3');
    expect([ ...list.classList ]).to.not.include('open');
    expect(getComputedStyle(badge).backgroundColor).to.not.equal(
      getComputedStyle(group).backgroundColor
    );
    expect(getComputedStyle(badge).color).to.not.equal(
      getComputedStyle(badge).backgroundColor
    );
  });

});

async function createCollapsedInputMapping(context, name, options = {}) {
  const playground = await createBpmnPlayground(context, name, {
    diagram: manyInputsDiagram,
    selectedElementId: 'Activity_0iraag0',
    ...options
  });

  await playground.setup.settle();
  playground.setup['select-element']();
  await playground.setup.settle();
  playground.setup['select-element']();
  await playground.setup.settle();

  const ioMapping = playground.element.businessObject.extensionElements.values.find(
    value => value.$type === 'zeebe:IoMapping'
  );

  expect(ioMapping.inputParameters).to.have.length(3);
  expect(playground.element.businessObject.$instanceOf('zeebe:ZeebeServiceTask')).to.be.true;

  const group = playground.setup['collapse-input-mapping']();
  await playground.setup.settle();

  return {
    badge: group.querySelector('.bio-properties-panel-list-badge'),
    group,
    list: group.querySelector('.bio-properties-panel-list'),
    playground
  };
}
