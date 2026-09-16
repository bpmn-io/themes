import { expect } from 'chai';

import {
  createFormPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('form-js playground', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('form')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should theme the viewer', async function() {
    playground = await createFormPlayground(this, 'form-viewer');

    const container = playground.root.querySelector('.fjs-container');
    const input = playground.root.querySelector('.fjs-input');
    const testContainer = playground.root.closest('.test-container');

    // then
    expect(container).to.exist;
    expect(input).to.exist;
    expect(testContainer.getBoundingClientRect().height).to.be.at.least(600);

    // only the deviations belong here — everything else form-js already resolves
    // through the shared tokens, so asserting it would test form-js, not this
    const styles = getComputedStyle(container);

    expect(styles.getPropertyValue('--font-family').trim()).to.equal(
      styles.getPropertyValue('--font-sans').trim()
    );

    // the design system puts inputs on white, not on the page surface
    expect(styles.getPropertyValue('--color-background').trim()).to.equal(
      styles.getPropertyValue('--input-background').trim()
    );

    // form-js gives inputs the small step, the design system rounds them `lg`
    expect(styles.getPropertyValue('--input-border-radius').trim()).to.equal(
      styles.getPropertyValue('--bio-radius-lg').trim()
    );
    expect(styles.getPropertyValue('--button-border-radius').trim()).to.equal(
      styles.getPropertyValue('--bio-radius-lg').trim()
    );
  });

  it('should theme the editor', async function() {
    playground = await createFormPlayground(this, 'form-editor', {
      variant: 'editor',
      selectedFieldId: 'Textfield_1'
    });

    await playground.setup.settle();

    const editor = playground.root.querySelector('.fjs-editor-container');
    const palette = playground.root.querySelector('.fjs-palette-container');
    const panel = playground.root.querySelector('.bio-properties-panel');

    // then
    expect(editor).to.exist;
    expect(palette).to.exist;
    expect(panel).to.exist;

    // the palette declares its own variables, so an override has to match that
    // element rather than the editor container around it
    const paletteStyles = getComputedStyle(palette);

    expect(
      paletteStyles.getPropertyValue('--color-palette-field-focus').trim()
    ).to.equal(paletteStyles.getPropertyValue('--ring').trim());
  });


  it('should theme the embedded properties panel', async function() {
    playground = await createFormPlayground(this, 'form-editor', {
      variant: 'editor',
      selectedFieldId: 'Textfield_1'
    });

    await playground.setup.settle();

    const panel = playground.root.querySelector('.bio-properties-panel');
    const panelStyles = getComputedStyle(panel);

    // then — the panel embedded in the editor is in scope of the theme, so it
    // resolves the same tokens it does standalone
    expect(panelStyles.getPropertyValue('--bio-border-input').trim()).to.equal(
      panelStyles.getPropertyValue('--input').trim()
    );
    expect(panelStyles.getPropertyValue('--color-focus').trim()).to.equal(
      panelStyles.getPropertyValue('--ring').trim()
    );

    // assert on the painted control: the panel draws the checkbox with
    // `appearance: none`, so a token can be mapped and still not render
    const checkbox = panel.querySelector('.bio-properties-panel-input[type="checkbox"]');

    checkbox.checked = true;

    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--primary-action-default)';
    panel.appendChild(probe);
    const primary = getComputedStyle(probe).backgroundColor;
    probe.remove();

    expect(getComputedStyle(checkbox).backgroundColor).to.equal(primary);
  });
});
