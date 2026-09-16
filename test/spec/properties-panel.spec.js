import { expect } from 'chai';

import { EditorView } from '@codemirror/view';

import {
  createBpmnPlayground,
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

  it('should keep expanded list-item titles at a consistent standard weight', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel');
    const root = playground.root;
    await playground.setup.settle();

    // open every group and expand every collapsible list item
    root.querySelectorAll('.bio-properties-panel-group-header').forEach((h) => {
      if (![ ...h.classList ].includes('open')) h.click();
    });
    await playground.setup.settle();
    root.querySelectorAll('.bio-properties-panel-collapsible-entry-header').forEach((h) => h.click());
    await playground.setup.settle();

    const itemTitles = [
      ...root.querySelectorAll(
        '.bio-properties-panel-collapsible-entry.open .bio-properties-panel-collapsible-entry-header-title'
      )
    ];

    // there is at least one expanded item to assert on
    expect(itemTitles.length).to.be.above(0);

    // every expanded item label renders at the same standard weight (matching
    // the stock panel, which never bolds collapsible entry titles)
    itemTitles.forEach((title) => {
      expect(getComputedStyle(title).fontWeight).to.equal('400');
    });
  });

  it('should apply the properties-panel adapter', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel');

    const panel = playground.root.querySelector('.bio-properties-panel');
    const testContainer = playground.root.closest('.test-container');

    // then
    expect(panel).to.exist;
    expect(testContainer.getBoundingClientRect().height).to.be.at.least(600);
    expect(panel.getBoundingClientRect().height).to.be.at.least(
      playground.root.getBoundingClientRect().height - 2
    );
    expect(getComputedStyle(panel).getPropertyValue('--focus-ring-width')).to.equal('3px');

    // compare rendered colors, not token text: the design system emits oklch,
    // so asserting literals would pin this to a design-system version
    const probe = document.createElement('div');
    panel.appendChild(probe);

    const render = (value) => {
      probe.style.backgroundColor = value;
      return getComputedStyle(probe).backgroundColor;
    };

    const inputBorder = render('var(--input-border-color)');
    const checkedCheckbox = render('var(--checkbox-checked-background-color)');
    const border = render('var(--input)');
    const primary = render('var(--primary-action-default)');

    probe.remove();

    expect(inputBorder).to.not.equal('rgba(0, 0, 0, 0)');
    expect(inputBorder).to.equal(border);
    expect(checkedCheckbox).to.equal(primary);
  });

  it('should persist the global theme selection in the URL', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel-theme-switcher');

    const bpmnIoButton = document.querySelector(
      '.theme-switcher button[data-theme="bpmn-io"]'
    );
    const c4Button = document.querySelector('.theme-switcher button[data-theme="c4"]');

    // when
    bpmnIoButton.click();

    // then
    expect([ ...document.documentElement.classList ]).to.not.include('c4-ui');
    expect(new URLSearchParams(window.location.search).get('theme')).to.equal('bpmn-io');

    // when
    c4Button.click();

    // then
    expect([ ...document.documentElement.classList ]).to.include('c4-ui');
    expect(new URLSearchParams(window.location.search).get('theme')).to.equal('c4');

    window.history.pushState(null, '', '?theme=bpmn-io');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect([ ...document.documentElement.classList ]).to.not.include('c4-ui');

    // restore the themed default the remaining specs render against
    c4Button.click();
  });

  it('should distinguish open and closed group headers', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel-section-hierarchy');

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
    playground = await createBpmnPlayground(this, 'properties-panel-input-states', {
      themeControls: true
    });

    // when
    await playground.setup.settle();
    playground.setup['open-group']('theme-controls');
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
    playground = await createBpmnPlayground(this, 'properties-panel-controls', {
      themeControls: true
    });

    await playground.setup.settle();
    playground.setup['open-group']('theme-controls');
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
    playground = await createBpmnPlayground(this, 'properties-panel-button-hierarchy', {
      themeControls: true
    });

    const templateSelector = playground.root.querySelector(
      '[data-group-id="group-ElementTemplates__Template"] .bio-properties-panel-select-template-button'
    );
    const createButton = playground.root.querySelector(
      '[data-group-id="group-inputs"] .bio-properties-panel-add-entry'
    );
    const arrow = playground.root.querySelector('.bio-properties-panel-arrow');

    // when
    await playground.setup.settle();

    const templateStyles = getComputedStyle(templateSelector);
    const createStyles = getComputedStyle(createButton);

    // read the ghost button's resting background before focusing it: a
    // programmatic focus matches `:focus-visible` in Firefox (but not Chrome),
    // which would swap in the accent fill and make "at rest" browser-dependent.
    const createRestBackground = createStyles.backgroundColor;
    const createRestColor = createStyles.color;

    // then
    // the template selector is the primary (filled) action...
    expect(templateStyles.backgroundColor).to.not.equal(createRestBackground);
    expect(createRestColor).to.not.equal(templateStyles.color);

    // ...while the add (+) control is a ghost button: transparent at rest and
    // sharing its styling with the expand arrow it belongs to the same family as.
    expect(createRestBackground).to.equal('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(arrow).backgroundColor).to.equal(createRestBackground);

    // against the arrow, not the template selector: that is a badge with its own
    // pill, so comparing across the two families would prove nothing
    expect(createStyles.borderTopLeftRadius).to.equal(getComputedStyle(arrow).borderTopLeftRadius);

    // and it takes a visible focus ring once focused
    createButton.focus();
    await playground.setup.settle();
    expect(getComputedStyle(createButton).outlineWidth).to.equal('2px');
  });

  it('should render a themed tooltip', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel-tooltip');

    // when
    await playground.setup.settle();
    playground.setup['show-task-definition-tooltip']();
    await playground.setup.settle();

    const tooltip = playground.root.querySelector('.bio-properties-panel-tooltip');

    // then
    expect(tooltip).to.exist;
    expect(tooltip.textContent).to.contain('Specify which job workers');
    expect(tooltip.closest('.c4-ui')).to.equal(document.documentElement);
  });

  it('should render an open themed dropdown', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel-dropdown', {
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
    playground = await createBpmnPlayground(this, 'properties-panel-example-data', {
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

  it('should give the JSON editor gutter the muted indicator fill', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel-example-data', {
      exampleData: true
    });

    // when
    playground.setup['open-example-data']();
    await playground.setup.settle();

    const group = playground.root.querySelector('[data-group-id="group-additionalDataGroup"]');
    const editor = group.querySelector('.cm-editor');
    const view = EditorView.findFromDOM(editor);

    // empty editor renders the `{ }` placeholder and the gutter spans the field
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: '' }
    });
    view.focus();
    await playground.setup.settle();

    // then
    // the gutter is the semantic prefix column (like the FEEL `=` indicator),
    // so it carries the same muted fill and left rounding and sits flush inside
    // the rounded focus ring rather than showing a square-cornered band
    const gutters = group.querySelector('.cm-gutters');
    const scroller = group.querySelector('.cm-scroller');
    const editorStyle = getComputedStyle(editor);

    // resolve the muted token the FEEL `=` indicator uses, in the themed context
    const probe = document.createElement('div');
    probe.style.background = 'var(--neutral-background-medium)';
    gutters.appendChild(probe);
    const mutedColor = getComputedStyle(probe).backgroundColor;
    probe.remove();

    const gutterStyle = getComputedStyle(gutters);
    expect(gutterStyle.backgroundColor).to.equal(mutedColor);
    expect(gutterStyle.borderTopLeftRadius).to.not.equal('0px');
    expect(editorStyle.overflow).to.equal('hidden');
    expect(editorStyle.borderTopLeftRadius).to.not.equal('0px');

    // the editing surface fills the editor, using the full field height
    expect(scroller.getBoundingClientRect().height)
      .to.be.closeTo(editor.getBoundingClientRect().height, 1);

    // and the muted gutter spans that full height rather than collapsing to a
    // short notch when the content underfills the field
    expect(gutters.getBoundingClientRect().height)
      .to.be.closeTo(editor.getBoundingClientRect().height, 1);
  });

  it('should align FEEL editor and input font sizing', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel-feel-typography');

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
    playground = await createBpmnPlayground(this, 'properties-panel-feel-typography');

    // when
    playground.setup['open-group']('taskDefinition');
    const entry = playground.setup['activate-job-type-feel']();
    await playground.setup.settle();

    const container = entry.querySelector('.bio-properties-panel-feel-container');

    // measure the actual text line, not `.cm-content` (which fills the height)
    const line = entry.querySelector('.cm-line');
    const indicator = entry.querySelector('.bio-properties-panel-feel-indicator');
    const indicatorStyles = getComputedStyle(indicator);

    // then — the field matches a plain control's height and the code line + the
    // `=` indicator sit centred within that single row (rather than pinned to the
    // raw top, overshooting the control height, or centred over a multi-line box)
    expect(container.getBoundingClientRect().height).to.be.closeTo(32, 2);
    expectVerticallyCentered(line, container);
    expect(indicatorStyles.display).to.equal('flex');
    expect(indicatorStyles.alignItems).to.equal('flex-start');
    expect(indicatorStyles.justifyContent).to.equal('center');

    // the glyph, not the full-height box that holds it: padding on one side
    // alone would tilt it off centre
    const glyph = document.createRange();
    glyph.selectNodeContents(indicator);

    expectVerticallyCentered(glyph, container, 1);
  });

  it('should vertically centre single-line JSON editor content', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel-validation', {
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

    // then — the field matches a plain control's height, the editor fills the
    // wrapper (so its background, diagnostics and focus ring stay flush with the
    // field box), and a single JSON line centres within it instead of pinning to
    // the top
    expect(wrapper.getBoundingClientRect().height).to.be.closeTo(32, 2);
    expect(editor.getBoundingClientRect().height).to.be.closeTo(
      wrapper.clientHeight, 1
    );
    expectVerticallyCentered(line, wrapper);
  });

  it('should vertically centre a single-line auto-resize textarea', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel');

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
    playground = await createBpmnPlayground(this, 'properties-panel-validation', {
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

  it('should theme the text popup', async function() {
    playground = await createBpmnPlayground(this, 'popup');

    // when
    playground.setup['text-popup']();
    await playground.setup.settle();

    const popup = document.querySelector('.bio-properties-panel-popup');
    const textarea = popup.querySelector('.bio-properties-panel-input');

    // then
    expect(popup).to.exist;
    expect(popup.closest('.c4-ui')).to.equal(document.documentElement);
    expect(popup.querySelector('.bio-properties-panel-popup__close')).to.exist;

    // the header carries a divider so it stays distinct from the editor content
    // (card and background resolve to the same fill in the light palette)
    const header = popup.querySelector('.bio-properties-panel-popup__header');
    const headerStyle = getComputedStyle(header);
    expect(headerStyle.borderBottomWidth).to.equal('1px');

    const probe = document.createElement('div');
    probe.style.borderColor = 'var(--border)';
    header.appendChild(probe);
    const borderColor = getComputedStyle(probe).borderTopColor;
    probe.remove();
    expect(headerStyle.borderBottomColor).to.equal(borderColor);

    // the portaled popup gets border-box from the upstream popup reset
    // (properties-panel #541); without it the full-height padded textarea would
    // overflow its body and spawn a spurious scrollbar
    expect(getComputedStyle(textarea).boxSizing).to.equal('border-box');
    expect(textarea.scrollHeight).to.be.at.most(textarea.clientHeight + 1);
  });

  it('should mark a stuck (sticky) group header with a fill and separator', async function() {
    playground = await createBpmnPlayground(this, 'properties-panel');
    await playground.setup.settle();

    // a scrolled-away open group header gains the `.sticky` class from core; the
    // theme must still fill + separate it so it reads as stuck rather than letting
    // content show through. Open a group, then simulate the stuck state directly.
    const header = playground.root.querySelector('.bio-properties-panel-group-header:not(.open)');
    header.click();
    await playground.setup.settle();
    header.classList.add('sticky');

    // resolve the fill the panel actually uses when stuck, so the assertion
    // survives a remap of the underlying token
    const probe = document.createElement('div');
    probe.style.background = 'var(--sticky-group-background-color)';
    header.appendChild(probe);
    const stuckFill = getComputedStyle(probe).backgroundColor;
    probe.remove();

    // then — stuck header carries an opaque fill (content cannot show through)
    // and a separator
    const style = getComputedStyle(header);
    expect(style.backgroundColor).to.equal(stuckFill);
    expect(style.backgroundColor).to.not.equal('rgba(0, 0, 0, 0)');
    expect(style.borderBottomWidth).to.equal('1px');
  });

  it('should render the FEEL popup editor edge-to-edge (no border)', async function() {
    playground = await createBpmnPlayground(this, 'feel-popup');

    // when
    playground.setup['feel-popup']();
    await playground.setup.settle();

    const popup = document.querySelector('.bio-properties-panel-feel-popup');
    const container = popup.querySelector('.bio-properties-panel-feel-editor-container');

    // the FEEL editor reuses .bio-properties-panel-input as its wrapper; inside
    // the popup that wrapper is what would otherwise round + clip the gutter
    const editorInput = container.querySelector('.bio-properties-panel-input');

    // then
    expect(popup.querySelector('.bio-properties-panel-popup__close')).to.exist;

    // editor wrapper fills the popup body without a border/radius of its own, so
    // it sits flush and does not clip the gutter corner or spawn spurious
    // scrollbars
    expect(getComputedStyle(container).borderTopWidth).to.equal('0px');
    expect(getComputedStyle(editorInput).borderTopLeftRadius).to.equal('0px');
    expect(getComputedStyle(editorInput).borderTopRightRadius).to.equal('0px');
  });

  it('should hide the inline FEEL editor while its popup is open', async function() {
    playground = await createBpmnPlayground(this, 'feel-popup');

    // core renders the inline FEEL field like this while its popup is open: the
    // "Opened in editor" placeholder is shown and the inline editor is hidden via
    // `.popupOpen .bio-properties-panel-input { display: none }`. Our layout
    // override carries higher specificity, so without a :not(.popupOpen) guard the
    // editor would remain visible and spill below the placeholder.
    const buildField = (popupOpen) => {
      const entry = document.createElement('div');
      entry.className = 'bio-properties-panel-entry';
      entry.innerHTML = `
        <div class="bio-properties-panel-feel-editor-container${popupOpen ? ' popupOpen' : ''}">
          <div class="bio-properties-panel-feel-editor__open-popup-placeholder">Opened in editor</div>
          <div class="bio-properties-panel-input"></div>
        </div>
      `;
      playground.root.querySelector('.bio-properties-panel').appendChild(entry);
      return entry;
    };

    // when
    const openField = buildField(true);
    const closedField = buildField(false);

    // then — hidden while the popup is open, laid out normally otherwise
    expect(getComputedStyle(openField.querySelector('.bio-properties-panel-input')).display)
      .to.equal('none');
    expect(getComputedStyle(closedField.querySelector('.bio-properties-panel-input')).display)
      .to.equal('flex');
  });
});

function expectVerticallyCentered(inner, outer, tolerance = 3) {
  const innerBounds = inner.getBoundingClientRect();
  const outerBounds = outer.getBoundingClientRect();

  const innerCenter = innerBounds.top + innerBounds.height / 2;
  const outerCenter = outerBounds.top + outerBounds.height / 2;

  expect(Math.abs(innerCenter - outerCenter)).to.be.at.most(tolerance);
}
