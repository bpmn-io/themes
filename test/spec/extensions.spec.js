import { expect } from 'chai';

import {
  createBpmnPlayground,
  isPlaygroundEnabled,
  shouldKeepPlayground
} from '../TestHelper.js';

/**
 * The minimap, token simulation and linting carry no C4 adapter: they are
 * expected to follow the theme through the `--bio-*` tokens alone. These specs
 * assert the tokens reach them, so a regression shows up as a failure rather
 * than as an unstyled surface nobody looks at.
 */
describe('bpmn-js extensions playground', function() {
  let playground;

  afterEach(function() {
    if (!shouldKeepPlayground()) {
      playground.destroy();
    }
  });


  describe('minimap', function() {

    before(function() {
      if (!isPlaygroundEnabled('minimap')) {
        this.skip();
      }
    });


    it('should theme the minimap', async function() {

      // given
      playground = await createBpmnPlayground(this, 'extensions-minimap', {
        minimap: true
      });

      const minimap = playground.root.querySelector('.djs-minimap');

      // when
      const style = getComputedStyle(minimap);

      // then
      expect(resolved(minimap, '--bio-surface'), 'tokens must reach the minimap').to.not.equal('');
      expect(style.backgroundColor).to.equal(mix(minimap, '--bio-surface', 0.9));
    });


    it('should round the minimap like a design system surface', async function() {

      // given
      playground = await createBpmnPlayground(this, 'extensions-minimap', {
        minimap: true
      });

      // when
      const { borderTopLeftRadius } = getComputedStyle(
        playground.root.querySelector('.djs-minimap')
      );

      // then
      expect(borderTopLeftRadius).to.equal('8px');
    });

  });


  describe('token simulation', function() {

    before(function() {
      if (!isPlaygroundEnabled('token-simulation')) {
        this.skip();
      }
    });


    it('should theme the token simulation palette', async function() {

      // given
      playground = await createBpmnPlayground(this, 'extensions-token-simulation', {
        tokenSimulation: true
      });

      const container = playground.root.querySelector('.bts-container');

      // when
      const primary = resolved(container, '--token-simulation-primary');

      // then
      expect(primary, 'tokens must reach the simulation chrome').to.not.equal('');
      expect(primary).to.equal(resolved(container, '--info-action-default'));
    });


    it('should resolve simulation colors to hex for the BPMN DI', async function() {

      // given
      playground = await createBpmnPlayground(this, 'extensions-token-simulation', {
        tokenSimulation: true
      });

      const simulationStyles = playground.modeler.get('simulationStyles');

      // when
      const color = simulationStyles.get('--token-simulation-element-stroke-color');

      // then
      expect(color).to.match(/^#[0-9a-f]{6}$/i);
    });

  });


  describe('linting', function() {

    before(function() {
      if (!isPlaygroundEnabled('linting')) {
        this.skip();
      }
    });


    it('should theme the linting markers', async function() {

      // given
      playground = await createBpmnPlayground(this, 'extensions-linting', {
        linting: true
      });

      playground.setup.lint();

      const marker = playground.root.querySelector('.cl-icon-error');

      // when
      const background = getComputedStyle(marker).backgroundColor;

      // then
      expect(background).to.equal(resolved(marker, '--bio-danger'));
    });

  });

});


// helpers //////////

/**
 * Resolve a custom property through a probe so a token and a painted color can
 * be compared in the same notation.
 */
function resolved(element, property) {
  const value = getComputedStyle(element).getPropertyValue(property).trim();

  if (!value) {
    return '';
  }

  const probe = document.createElement('div');

  probe.style.color = value;
  element.appendChild(probe);

  const color = getComputedStyle(probe).color;

  probe.remove();

  return color;
}

function mix(element, property, alpha) {
  const probe = document.createElement('div');

  probe.style.color = `color-mix(in srgb, ${
    getComputedStyle(element).getPropertyValue(property).trim()
  } ${alpha * 100}%, transparent)`;

  element.appendChild(probe);

  const color = getComputedStyle(probe).color;

  probe.remove();

  return color;
}
