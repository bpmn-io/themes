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

    // adapter tokens land on the form container
    expect(getComputedStyle(container).getPropertyValue('--color-text').trim()).to.equal(
      'hsl(240 10% 3.9%)'
    );
    expect(getComputedStyle(container).getPropertyValue('--color-borders').trim()).to.equal(
      'hsl(240 5.9% 90%)'
    );
    expect(getComputedStyle(container).getPropertyValue('--color-accent').trim()).to.equal(
      'hsl(240 5.9% 10%)'
    );
  });

  it('should render every styled viewer field', async function() {
    playground = await createFormPlayground(this, 'form-viewer-fields');

    const root = playground.root;

    // then — one of each themed field type is present
    [
      'textfield',
      'number',
      'datetime',
      'select',
      'radio',
      'checklist',
      'taglist',
      'textarea',
      'checkbox',
      'group',
      'button'
    ].forEach((type) => {
      expect(
        root.querySelector(`.fjs-form-field-${type}`),
        `expected a .fjs-form-field-${type}`
      ).to.exist;
    });

    // and the core themed controls render
    expect(root.querySelector('.fjs-input')).to.exist;
    expect(root.querySelector('.fjs-textarea')).to.exist;
    expect(root.querySelector('.fjs-button')).to.exist;
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

    // palette adopts the adapter surface
    expect(
      getComputedStyle(editor).getPropertyValue('--color-palette-container-background').trim()
    ).to.equal('hsl(0 0% 100%)');

    // the embedded properties panel inherits the properties-panel adapter
    expect(getComputedStyle(panel).getPropertyValue('--input-border-color').trim()).to.equal(
      'hsl(240 5.9% 90%)'
    );
  });
});
