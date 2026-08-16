import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const files = {
  ignored: [
    'coverage'
  ],
  build: [
    'eslint.config.mjs',
    'karma.config.cjs',
    'scripts/**/*.js',
    'test/capture/**/*.cjs'
  ],
  test: [
    'test/**/*.js'
  ]
};

export default [
  {
    ignores: files.ignored
  },

  // build
  ...bpmnIoPlugin.configs.node.map(config => {

    return {
      ...config,
      files: files.build
    };
  }),

  // lib + test
  ...bpmnIoPlugin.configs.browser.map(config => {

    return {
      ...config,
      ignores: files.build
    };
  }),

  // test
  ...bpmnIoPlugin.configs.mocha.map(config => {

    return {
      ...config,
      files: files.test,
      ignores: files.build
    };
  }),
  {
    languageOptions: {
      globals: {
        require: true
      }
    },
    files: files.test,
    ignores: files.build
  }
];
