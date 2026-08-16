const path = require('path');

const baseConfigFactory = require('../../karma.config.cjs');
const captureReporter = require('./reporter.cjs');

/*
 * Capture karma config: runs the real spec suite (`test/testBundle.js`) in
 * retained mode (SINGLE_START=all), headlessly, and lets the `capture` reporter
 * persist each mounted scenario to disk.
 *
 * The specs are the single source of truth for scenarios; select a subset with
 * mocha's `--grep` (the `tldr` reporter forwards it from the karma CLI).
 */
module.exports = function(karma) {
  baseConfigFactory({
    set(config) {
      config.basePath = path.resolve(__dirname, '..', '..');

      // headless only (base adds a manual "Debug" browser for SINGLE_START)
      config.browsers = [ 'ChromeHeadless' ];

      // expose retained-mode + capture flags to the browser
      config.envPreprocessor = [ 'SINGLE_START', 'CAPTURE' ];

      // keep karma auto-loaded plugins, add the capture reporter
      config.plugins = [ 'karma-*', captureReporter ];

      // `tldr` (base default) forwards CLI --grep to mocha for scenario selection
      config.reporters = [ 'tldr', 'capture' ];

      config.captureReporter = {
        dir: '.captures'
      };

      config.browserConsoleLogOptions = {
        level: 'log',
        terminal: false
      };

      karma.set(config);
    }
  });
};
