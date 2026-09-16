/**
 * Where each consumer keeps the tokens it copied from this package, relative to
 * the directory holding the checkouts. Entries are added as libraries adopt the
 * layer.
 *
 * TODO(theme): resolve these from the registry once the consumers are released,
 * so the audit reports what is published rather than what happens to be checked
 * out locally.
 */
export default {
  'diagram-js': 'diagram-js/assets/diagram-js.css',
  'bpmn-js': 'bpmn-js/assets/bpmn-js.css',
  '@bpmn-io/properties-panel': 'properties-panel/src/assets/properties-panel.css',
  'bpmn-js-element-templates': 'bpmn-js-element-templates/assets/element-templates.css',
  '@bpmn-io/form-js-viewer': 'form-js/packages/form-js-viewer/assets/form-js-base.css',
  '@bpmn-io/form-js-editor': 'form-js/packages/form-js-editor/assets/form-js-editor-base.css'
};
