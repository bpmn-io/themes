import { expect } from 'chai';

import { EditorView } from '@codemirror/view';

import {
  createPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('properties-panel', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('properties-panel')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should apply the properties-panel adapter', async function() {
    playground = await createPlayground(this, 'properties-panel');

    const panel = playground.root.querySelector('.bio-properties-panel');
    const testContainer = playground.root.closest('.test-container');

    // then
    expect(panel).to.exist;
    expect(testContainer.getBoundingClientRect().height).to.be.at.least(600);
    expect(panel.getBoundingClientRect().height).to.be.at.least(
      playground.root.getBoundingClientRect().height - 2
    );
    expect(getComputedStyle(panel).getPropertyValue('--input-border-color')).to.equal(
      'hsl(240 5.9% 90%)'
    );
    expect(getComputedStyle(panel).getPropertyValue('--focus-ring-width')).to.equal('3px');
    expect(getComputedStyle(panel).getPropertyValue('--checkbox-checked-background-color')).to.equal(
      'hsl(240 5.9% 10%)'
    );
  });

  it('should persist the global theme selection in the URL', async function() {
    playground = await createPlayground(this, 'properties-panel-theme-switcher');

    const originalButton = document.querySelector(
      '.theme-switcher button[data-theme="original"]'
    );
    const shadcnButton = document.querySelector(
      '.theme-switcher button[data-theme="shadcn"]'
    );
    const c4Button = document.querySelector('.theme-switcher button[data-theme="c4"]');

    // when
    originalButton.click();

    // then
    expect([ ...playground.root.classList ]).to.not.include('bpmn-io-shadcn-theme');
    expect(new URLSearchParams(window.location.search).get('theme')).to.equal('original');

    // when
    shadcnButton.click();

    // then
    expect([ ...playground.root.classList ]).to.include('bpmn-io-shadcn-theme');
    expect(new URLSearchParams(window.location.search).get('theme')).to.equal('shadcn');

    // when
    c4Button.click();

    // then
    expect([ ...playground.root.classList ]).to.include('bpmn-io-shadcn-theme');
    expect([ ...playground.root.parentElement.classList ]).to.include('c4-ui');
    expect(new URLSearchParams(window.location.search).get('theme')).to.equal('c4');

    window.history.pushState(null, '', '?theme=original');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect([ ...playground.root.classList ]).to.not.include('bpmn-io-shadcn-theme');

    shadcnButton.click();
  });

  it('should distinguish open and closed group headers', async function() {
    playground = await createPlayground(this, 'properties-panel-section-hierarchy');

    // when
    await playground.setup.settle();
    const openGroup = playground.setup['open-group']('taskDefinition');
    await playground.setup.settle();

    const openHeader = openGroup.querySelector('.bio-properties-panel-group-header');
    const closedHeader = playground.root.querySelector(
      '[data-group-id="group-jobPriorityDefinition"] .bio-properties-panel-group-header'
    );

    // then
    expect([ ...openHeader.classList ]).to.include('open');
    expect([ ...closedHeader.classList ]).to.not.include('open');

    // The hierarchy is carried by the bold title and a flush, border-less header
    // (as in the stock panel) rather than an extra header fill.
    expect(getComputedStyle(openHeader).backgroundColor).to.equal('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(openHeader).borderBottomWidth).to.equal('0px');

    const openTitleWeight = getComputedStyle(
      openHeader.querySelector('.bio-properties-panel-group-header-title')
    ).fontWeight;
    const closedTitleWeight = getComputedStyle(
      closedHeader.querySelector('.bio-properties-panel-group-header-title')
    ).fontWeight;

    expect(openTitleWeight).to.equal('600');
    expect(closedTitleWeight).to.not.equal('600');
  });

  it('should render focused, invalid and disabled input states', async function() {
    playground = await createPlayground(this, 'properties-panel-input-states', {
      themeControls: true
    });

    // when
    await playground.setup.settle();
    playground.setup['focus-theme-input']();
    playground.setup['invalidate-theme-input']();
    await playground.setup.settle();

    const focusedInput = playground.root.querySelector('[data-entry-id="theme-focus"] input');
    const errorEntry = playground.root.querySelector('[data-entry-id="theme-error"]');
    const disabledInput = playground.root.querySelector('[data-entry-id="theme-disabled"] input');

    // then
    expect(focusedInput).to.exist;
    expect([ ...errorEntry.classList ]).to.include('has-error');
    expect(errorEntry.querySelector('.bio-properties-panel-error')).to.exist;
    expect(disabledInput.disabled).to.be.true;
  });

  it('should render select, checkbox, toggle and list states', async function() {
    playground = await createPlayground(this, 'properties-panel-controls', {
      themeControls: true
    });

    await playground.setup.settle();

    const select = playground.root.querySelector('[data-entry-id="theme-select"] select');
    const checkbox = playground.root.querySelector('[data-entry-id="theme-checkbox"] input');
    const toggle = playground.root.querySelector('[data-entry-id="theme-toggle"] input');
    const list = playground.root.querySelector('[data-entry-id="theme-list"]');

    // then
    expect(select.value).to.equal('first');
    expect(checkbox.checked).to.be.true;
    expect(toggle.checked).to.be.true;
    expect([ ...list.classList ]).to.include('open');
    expect(list.querySelectorAll('.bio-properties-panel-list-entry-item')).to.have.length(2);
  });

  it('should distinguish primary and ghost header actions', async function() {
    playground = await createPlayground(this, 'properties-panel-button-hierarchy', {
      themeControls: true
    });

    const templateSelector = playground.root.querySelector(
      '[data-group-id="group-ElementTemplates__Template"] .bio-properties-panel-select-template-button'
    );
    const createButton = playground.root.querySelector(
      '[data-group-id="group-inputs"] .bio-properties-panel-add-entry'
    );

    // when
    createButton.focus();
    await playground.setup.settle();

    const templateStyles = getComputedStyle(templateSelector);
    const createStyles = getComputedStyle(createButton);
    const arrow = playground.root.querySelector('.bio-properties-panel-arrow');

    // then
    // the template selector is the primary (filled) action...
    expect(templateStyles.backgroundColor).to.not.equal(createStyles.backgroundColor);
    expect(createStyles.color).to.not.equal(templateStyles.color);

    // ...while the add (+) control is a ghost button: transparent at rest and
    // sharing its styling with the expand arrow it belongs to the same family as.
    expect(createStyles.backgroundColor).to.equal('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(arrow).backgroundColor).to.equal(createStyles.backgroundColor);

    expect(createStyles.borderTopLeftRadius).to.equal(templateStyles.borderTopLeftRadius);
    expect(createStyles.outlineWidth).to.equal('2px');
  });

  it('should render a themed tooltip', async function() {
    playground = await createPlayground(this, 'properties-panel-tooltip');

    // when
    await playground.setup.settle();
    playground.setup['show-task-definition-tooltip']();
    await playground.setup.settle();

    const tooltip = playground.root.querySelector('.bio-properties-panel-tooltip');

    // then
    expect(tooltip).to.exist;
    expect(tooltip.textContent).to.contain('Specify which job workers');
    expect(tooltip.closest('.bpmn-io-shadcn-theme')).to.equal(playground.root);
  });

  it('should render an open themed dropdown', async function() {
    playground = await createPlayground(this, 'properties-panel-dropdown', {
      themeControls: true
    });

    // when
    playground.setup['open-theme-actions']();
    await playground.setup.settle();

    const dropdown = playground.root.querySelector('.bio-properties-panel-dropdown-button');

    // then
    expect([ ...dropdown.classList ]).to.include('open');
    expect(dropdown.querySelectorAll('.bio-properties-panel-dropdown-button__menu-item')).to.have.length(3);
  });

  it('should render the example data JSON editor', async function() {
    playground = await createPlayground(this, 'properties-panel-example-data', {
      exampleData: true
    });

    // when
    playground.setup['open-example-data']();
    await playground.setup.settle();

    const group = playground.root.querySelector('[data-group-id="group-additionalDataGroup"]');
    const editor = group.querySelector('.cm-editor');
    const view = EditorView.findFromDOM(editor);

    // then
    expect(group).to.exist;
    expect(view.state.doc.toString()).to.equal(
      '{"order": { "id": "123" }, "approved": true}'
    );
  });

  it('should align FEEL editor and input font sizing', async function() {
    playground = await createPlayground(this, 'properties-panel-feel-typography');

    // when
    playground.setup['open-group']('taskDefinition');
    const entry = playground.setup['activate-job-type-feel']();
    await playground.setup.settle();

    const input = playground.root.querySelector(
      '[data-entry-id="taskDefinitionRetries"] .bio-properties-panel-input'
    );
    const editorContent = entry.querySelector('.cm-content');
    const inputStyles = getComputedStyle(input);
    const editorStyles = getComputedStyle(editorContent);

    // then
    expect([ ...entry.querySelector('.bio-properties-panel-feel-entry').classList ]).to.include('feel-active');
    expect(editorStyles.fontSize).to.equal(inputStyles.fontSize);
    expect(editorStyles.lineHeight).to.equal(inputStyles.lineHeight);
  });

  it('should vertically centre single-line FEEL editor content', async function() {
    playground = await createPlayground(this, 'properties-panel-feel-typography');

    // when
    playground.setup['open-group']('taskDefinition');
    const entry = playground.setup['activate-job-type-feel']();
    await playground.setup.settle();

    const container = entry.querySelector('.bio-properties-panel-feel-container');
    const editor = entry.querySelector('.cm-editor');

    // measure the actual text line, not `.cm-content` (which fills the height)
    const line = entry.querySelector('.cm-line');
    const indicator = entry.querySelector('.bio-properties-panel-feel-indicator');
    const indicatorStyles = getComputedStyle(indicator);

    // then — the editor fills the control height and the code line + the `=`
    // indicator sit centred within the first row (rather than pinned to the raw
    // top, or centred over the full multi-line height)
    expect(editor.getBoundingClientRect().height).to.be.closeTo(32, 2);
    expectVerticallyCentered(line, container);
    expect(indicatorStyles.display).to.equal('flex');
    expect(indicatorStyles.alignItems).to.equal('flex-start');
    expect(indicatorStyles.justifyContent).to.equal('center');

    // the glyph is nudged down by half the surplus between control height and a
    // single line, so it lines up with the first code row
    expect(parseFloat(indicatorStyles.paddingTop)).to.be.closeTo(5.5, 1);
  });

  it('should vertically centre single-line JSON editor content', async function() {
    playground = await createPlayground(this, 'properties-panel-validation', {
      exampleData: true
    });

    // when
    playground.setup['open-example-data']();
    await playground.setup.settle();

    const entry = playground.root.querySelector('[data-entry-id="exampleJson"]');
    const view = EditorView.findFromDOM(entry.querySelector('.cm-editor'));

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: '{"order": ' }
    });
    await playground.setup.settle();

    const wrapper = entry.querySelector('.bio-properties-panel-input');
    const editor = entry.querySelector('.cm-editor');
    const line = entry.querySelector('.cm-line');

    // then — a single JSON line fills and centres within the control height, so
    // it sits fully inside the (error) focus ring instead of overflowing the top
    expect(editor.getBoundingClientRect().height).to.be.closeTo(32, 2);
    expectVerticallyCentered(line, wrapper);
  });

  it('should vertically centre a single-line auto-resize textarea', async function() {
    playground = await createPlayground(this, 'properties-panel');

    // when
    const group = playground.setup['open-group']('documentation');
    await playground.setup.settle();

    const textarea = group.querySelector('textarea.bio-properties-panel-input');

    textarea.value = 'a single line';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await playground.setup.settle();

    const styles = getComputedStyle(textarea);
    const paddingTop = parseFloat(styles.paddingTop);
    const paddingBottom = parseFloat(styles.paddingBottom);

    // then — one line renders at the shared control height with balanced
    // padding, so the text sits centred like a plain input
    expect(textarea.getBoundingClientRect().height).to.be.closeTo(32, 2);
    expect(Math.abs(paddingTop - paddingBottom)).to.be.at.most(1);
  });

  it('should render the example data JSON validation error', async function() {
    playground = await createPlayground(this, 'properties-panel-validation', {
      exampleData: true
    });

    // when
    playground.setup['open-example-data']();
    await playground.setup.settle();

    const entry = playground.root.querySelector('[data-entry-id="exampleJson"]');
    const editor = entry.querySelector('.cm-editor');
    const view = EditorView.findFromDOM(editor);

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: '{"order": '
      }
    });

    await playground.setup.settle();

    // then
    expect([ ...entry.classList ]).to.include('has-error');
    expect(entry.querySelector('.bio-properties-panel-error')).to.exist;
  });

  it('should mount the text popup inside the stock theme root', async function() {
    playground = await createPlayground(this, 'popup');

    // when
    playground.setup['text-popup']();
    await playground.setup.settle();

    const popup = playground.root.querySelector('.bio-properties-panel-popup');
    const textarea = popup.querySelector('.bio-properties-panel-input');

    // then
    expect(popup).to.exist;
    expect(popup.closest('.bpmn-io-shadcn-theme')).to.equal(playground.root);
    expect(popup.querySelector('.bio-properties-panel-popup__close')).to.exist;

    // portaled popups miss the vendor border-box reset; without it the
    // full-height padded textarea overflows its body and spawns a scrollbar
    expect(getComputedStyle(textarea).boxSizing).to.equal('border-box');
    expect(textarea.scrollHeight).to.be.at.most(textarea.clientHeight + 1);

    expectContainedInScenario(popup, playground.root);
  });

  it('should render the FEEL popup editor edge-to-edge (no border)', async function() {
    playground = await createPlayground(this, 'feel-popup');

    // when
    playground.setup['feel-popup']();
    await playground.setup.settle();

    const popup = playground.root.querySelector('.bio-properties-panel-feel-popup');
    const editor = popup.querySelector('.bio-properties-panel-feel-editor-container');

    // then
    expect(popup.querySelector('.bio-properties-panel-popup__close')).to.exist;

    // editor fills the popup body without a border/radius of its own, so it
    // does not overflow and spawn spurious scrollbars
    expect(getComputedStyle(editor).borderTopWidth).to.equal('0px');
    expect(getComputedStyle(editor).borderTopLeftRadius).to.equal('0px');

    expectContainedInScenario(popup, playground.root);
  });

});

function expectContainedInScenario(popup, scenario) {
  const popupBounds = popup.getBoundingClientRect();
  const scenarioBounds = scenario.getBoundingClientRect();

  expect(popupBounds.left).to.be.at.least(scenarioBounds.left);
  expect(popupBounds.right).to.be.at.most(scenarioBounds.right);
  expect(popupBounds.top).to.be.at.least(scenarioBounds.top);
  expect(popupBounds.bottom).to.be.at.most(scenarioBounds.bottom);
}

function expectVerticallyCentered(inner, outer, tolerance = 3) {
  const innerBounds = inner.getBoundingClientRect();
  const outerBounds = outer.getBoundingClientRect();

  const innerCenter = innerBounds.top + innerBounds.height / 2;
  const outerCenter = outerBounds.top + outerBounds.height / 2;

  expect(Math.abs(innerCenter - outerCenter)).to.be.at.most(tolerance);
}
