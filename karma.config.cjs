const path = require('path');

const fs = require('fs');

const {
  DefinePlugin
} = require('webpack');

const browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');
const singleStart = process.env.SINGLE_START;

const tmpDir = path.join(__dirname, 'tmp');

fs.mkdirSync(tmpDir, { recursive: true });

// Firefox refuses to capture without a writable, dedicated profile, so hand the
// headless launcher a throwaway one.
const firefoxProfile = fs.mkdtempSync(path.join(tmpDir, 'firefox-profile'));

module.exports = function(karma) {
  const config = {
    basePath: '.',
    frameworks: [
      'webpack',
      'mocha'
    ],
    files: [
      'test/testBundle.js',
      {
        pattern: 'node_modules/@camunda/design-system/dist/files/**/*',
        included: false,
        served: true,
        watched: false
      }
    ],
    preprocessors: {
      'test/testBundle.js': [
        'webpack',
        'env'
      ]
    },
    reporters: [ 'tldr' ],
    customLaunchers: {
      'FirefoxHeadless': {
        base: 'Firefox',
        flags: [ '-headless' ],
        profile: firefoxProfile
      }
    },
    browsers,
    client: {
      mocha: {
        timeout: 10000
      }
    },
    singleRun: true,
    autoWatch: false,
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(css|bpmn|dmn)$/,
            use: 'raw-loader'
          }
        ]
      },
      plugins: [
        new DefinePlugin({
          'process.env': {}
        })
      ],
      resolve: {
        mainFields: [
          'browser',
          'module',
          'main'
        ],
        modules: [
          'node_modules',
          path.resolve(__dirname)
        ]
      },
      devtool: 'eval-source-map'
    }
  };

  if (singleStart) {
    config.browsers = config.browsers.concat('Debug');
    config.envPreprocessor = [ 'SINGLE_START' ];
  }

  karma.set(config);
};
