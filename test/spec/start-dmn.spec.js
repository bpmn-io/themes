import {
  createDmnPlayground,
  isStartOnly
} from '../TestHelper.js';

/*
 * Canonical dmn playground.
 *
 * One dmn-js modeler with the theme applied, opened on the DRD. The drill-down
 * badges and the view switch move to the decision table and the literal and
 * boxed expression editors, so every themed surface is reachable from here.
 * Meant for humans to try the customization as a whole via `npm run start:dmn`.
 *
 * This is exploration-only, so it is skipped during `npm test` (which runs the
 * scenario specs in dmn.spec.js) and only mounts when started explicitly.
 */
describe('dmn playground', function() {

  before(function() {
    if (!isStartOnly('dmn-playground')) {
      this.skip();
    }
  });

  it('renders the modeler with the theme applied', async function() {
    await createDmnPlayground(this, 'dmn-playground');
  });
});
