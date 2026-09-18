import {
  createFormPlaygroundApp,
  isStartOnly
} from '../TestHelper.js';

/*
 * Canonical form playground.
 *
 * The real `@bpmn-io/form-js-playground`, which puts the editor, the live
 * preview and the schema side by side, with the theme applied. Meant for humans
 * to try the form customization as a whole via `npm run start:form`.
 *
 * This is exploration-only, so it is skipped during `npm test` (which runs the
 * scenario specs in form.spec.js) and only mounts when started explicitly.
 */
describe('form playground', function() {

  before(function() {
    if (!isStartOnly('form-playground')) {
      this.skip();
    }
  });

  it('renders the playground with the theme applied', async function() {
    await createFormPlaygroundApp(this, 'form-playground');
  });
});
