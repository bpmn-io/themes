import { expect } from 'chai';

import {
  createBpmnPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

import executionListenersDiagram from '../fixtures/execution-listeners.bpmn';

describe('execution listeners', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('execution-listeners')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should render nested execution listener and header lists', async function() {
    const scenario = await createExecutionListeners(this, 'execution-listeners');
    playground = scenario.playground;

    const {
      group,
      listenerEntries,
      headerList,
      headerItemEntries
    } = scenario;

    // then
    // parent list group renders both listeners with a count badge
    expect(group.querySelector('.bio-properties-panel-list-badge').textContent).to.equal('2');
    expect(group.querySelectorAll('.bio-properties-panel-list-item')).to.have.length(2);

    // expanded listener reveals its nested Headers list
    expect([ ...listenerEntries.classList ]).to.include('open');
    expect(headerList).to.exist;
    expect(headerList.querySelector('.bio-properties-panel-list-badge').textContent).to.equal('1');
    expect(
      headerList.querySelectorAll('.bio-properties-panel-list-entry-item')
    ).to.have.length(1);

    // expanded header reveals its Key/Value fields
    expect([ ...headerItemEntries.classList ]).to.include('open');
    expect(headerItemEntries.querySelector('input')).to.exist;
  });

  it('should indent each nesting level with a side line', async function() {
    const scenario = await createExecutionListeners(this, 'execution-listeners-nesting');
    playground = scenario.playground;

    const {
      listenerField,
      headerField
    } = scenario;

    // then
    // each nesting level is indented further than its parent
    const listenerLeft = listenerField.getBoundingClientRect().left;
    const headerLeft = headerField.getBoundingClientRect().left;

    expect(headerLeft).to.be.greaterThan(listenerLeft);

    // a visible side line connects the nested entries to their parent
    const sideLine = getComputedStyle(scenario.listenerEntries, '::before');

    expect(sideLine.content).to.not.equal('none');
    expect(sideLine.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
    expect(parseFloat(sideLine.width)).to.be.greaterThan(0);
  });

  it('should distinguish the nested list dot from its side line', async function() {
    const scenario = await createExecutionListeners(this, 'execution-listeners');
    playground = scenario.playground;

    // the nested Headers list-entry carries the ::before dot that sits on the
    // side line of its enclosing listener entries
    const listEntry = scenario.headerList;
    const entries = listEntry.closest('.bio-properties-panel-collapsible-entry-entries');

    const dotColor = getComputedStyle(listEntry, '::before').backgroundColor;
    const sideLineColor = getComputedStyle(entries, '::before').backgroundColor;

    // the dot reads as a marker on the lighter side line rather than a
    // continuation of it, so the two are deliberately distinct
    expect(dotColor).to.not.equal('rgba(0, 0, 0, 0)');
    expect(sideLineColor).to.not.equal(dotColor);
  });

  it('should keep listener titles at a consistent weight, separating open state structurally', async function() {
    const scenario = await createExecutionListeners(this, 'execution-listeners-hierarchy');
    playground = scenario.playground;

    const {
      openListenerTitle,
      collapsedListenerTitle
    } = scenario;

    // then
    // item titles keep a single, consistent weight regardless of open state
    // (the stock panel never bolds collapsible entry titles) ...
    const openWeight = Number(getComputedStyle(openListenerTitle).fontWeight);
    const collapsedWeight = Number(getComputedStyle(collapsedListenerTitle).fontWeight);

    expect(openWeight).to.equal(collapsedWeight);

    // ... and the open/collapsed distinction is carried structurally, by the
    // expanded entry revealing its nested content
    const openEntry = openListenerTitle.closest('.bio-properties-panel-collapsible-entry');
    const collapsedEntry = collapsedListenerTitle.closest('.bio-properties-panel-collapsible-entry');

    expect([ ...openEntry.classList ]).to.include('open');
    expect([ ...collapsedEntry.classList ]).to.not.include('open');
  });

});

async function createExecutionListeners(context, name, options = {}) {
  const playground = await createBpmnPlayground(context, name, {
    diagram: executionListenersDiagram,
    selectedElementId: 'Activity_0iraag0',
    ...options
  });

  // list groups only populate after the panel re-renders for the selection
  await playground.setup.settle();
  playground.setup['select-element']();
  await playground.setup.settle();
  playground.setup['select-element']();
  await playground.setup.settle();

  const group = playground.setup['open-group']('Zeebe__ExecutionListeners');
  await playground.setup.settle();

  const listenerEntry = playground.setup['toggle-collapsible']('Activity_0iraag0-executionListener-0');
  await playground.setup.settle();

  playground.setup['toggle-list-entry']('Activity_0iraag0-executionListener-0-headers');
  await playground.setup.settle();

  const headerItem = playground.setup['toggle-collapsible'](
    'Activity_0iraag0-executionListener-0-headers-header-0'
  );
  await playground.setup.settle();

  const headerList = playground.root.querySelector(
    '[data-entry-id="Activity_0iraag0-executionListener-0-headers"]'
  );

  return {
    playground,
    group,
    listenerEntries: listenerEntry.querySelector('.bio-properties-panel-collapsible-entry-entries'),
    headerList,
    headerItemEntries: headerItem.querySelector('.bio-properties-panel-collapsible-entry-entries'),
    listenerField: playground.root.querySelector(
      '[data-entry-id="Activity_0iraag0-executionListener-0-eventType"]'
    ),
    headerField: playground.root.querySelector(
      '[data-entry-id="Activity_0iraag0-executionListener-0-headers-header-0-key"]'
    ),
    openListenerTitle: playground.root.querySelector(
      '[data-entry-id="Activity_0iraag0-executionListener-0"] .bio-properties-panel-collapsible-entry-header-title'
    ),
    collapsedListenerTitle: playground.root.querySelector(
      '[data-entry-id="Activity_0iraag0-executionListener-1"] .bio-properties-panel-collapsible-entry-header-title'
    )
  };
}
