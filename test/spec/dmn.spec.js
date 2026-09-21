import { expect } from 'chai';

import {
  createDmnPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

describe('dmn-js playground', function() {
  let playground;

  before(function() {
    if (!isPlaygroundEnabled('dmn')) {
      this.skip();
    }
  });

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });

  it('should reach the DRD container', async function() {

    // when
    playground = await createDmnPlayground(this, 'dmn-drd');

    // then
    const style = containerStyle(playground, 'drd');

    expect(style.getPropertyValue('--drill-down-overlay-background-color'))
      .to.equal(style.getPropertyValue('--bio-canvas-accent'));
  });


  it('should draw the drill-down badge in the canvas accent', async function() {

    // given
    playground = await createDmnPlayground(this, 'dmn-drill-down');

    const container = playground.root.querySelector('.dmn-drd-container');

    // when
    const { backgroundColor } = getComputedStyle(
      container.querySelector('.drill-down-overlay > button')
    );

    // then
    expect(backgroundColor).to.equal(resolveColor(container, '--bio-canvas-accent'));
  });


  it('should reach the decision table container', async function() {

    // when
    playground = await createDmnPlayground(this, 'dmn-decision-table', {
      view: 'decisionTable'
    });

    // then
    const style = containerStyle(playground, 'decision-table');

    expect(style.getPropertyValue('--decision-table-font-family'))
      .to.equal(style.getPropertyValue('--font-sans'));
  });


  it('should reach the literal expression container', async function() {

    // when
    playground = await createDmnPlayground(this, 'dmn-literal-expression', {
      view: 'literalExpression'
    });

    // then
    const style = containerStyle(playground, 'literal-expression');

    expect(style.getPropertyValue('--literal-expression-font-family'))
      .to.equal(style.getPropertyValue('--font-sans'));
  });


  it('should reach the boxed expression container', async function() {

    // when
    playground = await createDmnPlayground(this, 'dmn-boxed-expression', {
      view: 'boxedExpression'
    });

    // then
    const style = containerStyle(playground, 'boxed-expression');

    expect(style.getPropertyValue('--boxed-expression-font-family'))
      .to.equal(style.getPropertyValue('--font-sans'));
  });


  it('should paint the decision table grid with the design system border', async function() {

    // given
    playground = await createDmnPlayground(this, 'dmn-decision-table-grid', {
      view: 'decisionTable'
    });

    const container = playground.root.querySelector('.dmn-decision-table-container');

    // when
    const painted = getComputedStyle(container.querySelector('td')).borderBottomColor;

    // then
    expect(painted).to.equal(resolveColor(container, '--border'));
  });


  it('should round the view switch like a design system button', async function() {

    // given
    playground = await createDmnPlayground(this, 'dmn-view-switch', {
      view: 'decisionTable'
    });

    // when
    const { borderTopLeftRadius } = getComputedStyle(
      playground.root.querySelector('.view-drd-button')
    );

    // then
    expect(borderTopLeftRadius).to.equal('8px');
  });


  it('should darken the add-column icon on hover', async function() {

    // given
    playground = await createDmnPlayground(this, 'dmn-add-column-icon', {
      view: 'decisionTable'
    });

    const container = playground.root.querySelector('.dmn-decision-table-container');

    // when
    const resting = resolveColor(container, '--add-column-icon-background-color');
    const hovered = resolveColor(container, '--action-icon-hover-background-color');

    // then
    expect(hovered).to.not.equal(resting);
  });
});


// helpers //////////

function containerStyle(playground, view) {
  const container = playground.root.querySelector(`.dmn-${view}-container`);

  expect(container, `.dmn-${view}-container`).to.exist;

  return getComputedStyle(container);
}

/**
 * Resolve a custom property through a probe so a token and a painted colour can
 * be compared in the same notation.
 */
function resolveColor(element, property) {
  const probe = document.createElement('div');

  probe.style.color = getComputedStyle(element).getPropertyValue(property);

  element.appendChild(probe);

  const color = getComputedStyle(probe).color;

  probe.remove();

  return color;
}
