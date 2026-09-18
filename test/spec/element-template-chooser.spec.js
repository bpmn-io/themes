import { expect } from 'chai';

import {
  createBpmnPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('element-template-chooser playground', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('element-template-chooser')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should expose the chooser popup surface', async function() {
    playground = await createBpmnPlayground(this, 'element-template-chooser');

    // when
    playground.setup.chooser();

    const canvas = playground.root.querySelector('.playground-canvas');
    const popup = playground.root.querySelector('.element-template-chooser');
    const canvasBounds = canvas.getBoundingClientRect();
    const popupBounds = popup.getBoundingClientRect();

    // then
    expect(popup).to.exist;
    expect(popupBounds.left).to.be.at.least(canvasBounds.left);
    expect(popupBounds.right).to.be.at.most(canvasBounds.right);
    expect(popupBounds.top).to.be.at.least(canvasBounds.top);
    expect(popupBounds.bottom).to.be.at.most(canvasBounds.bottom);
  });

  it('should render the properties-panel template selector', async function() {
    playground = await createBpmnPlayground(this, 'element-template-selector');

    const selector = playground.root.querySelector(
      '[data-group-id="group-ElementTemplates__Template"] .bio-properties-panel-select-template-button'
    );

    // then
    expect(selector).to.exist;
    expect(selector.textContent.trim()).to.equal('Select');
  });

  it('should render an applied template action above later group headers', async function() {
    playground = await createBpmnPlayground(this, 'element-template-actions');

    // when
    await playground.setup.settle();
    playground.setup['apply-template']();
    await playground.setup.settle();

    const action = playground.root.querySelector('.bio-properties-panel-applied-template-button');

    action.click();
    action.scrollIntoView({ block: 'center' });
    await playground.setup.settle();

    const menu = action.querySelector('.bio-properties-panel-dropdown-button__menu');
    const menuItems = menu.querySelectorAll('.bio-properties-panel-dropdown-button__menu-item--actionable');
    const trigger = action.querySelector('.bio-properties-panel-group-header-button');
    const header = action.closest('.bio-properties-panel-group-header');

    // then
    expect([ ...action.classList ]).to.include('open');
    expect(menuItems).to.have.length(2);
    expect(getComputedStyle(trigger).backgroundColor).to.not.equal(
      getComputedStyle(header).backgroundColor
    );

    menuItems.forEach(menuItem => {
      const bounds = menuItem.getBoundingClientRect();
      const element = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2
      );

      expect(
        menu.contains(element),
        `expected menu item to be topmost, received ${element?.className || element?.tagName}`
      ).to.be.true;
    });
  });
});
