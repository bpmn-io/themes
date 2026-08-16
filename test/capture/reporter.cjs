const fs = require('fs');
const path = require('path');

const {
  buildComparisonHtml,
  buildIndex
} = require('./buildHtml.cjs');

const CAPTURE_RE = /CAPTURE::([\w-]+)::([A-Za-z0-9+/=]+)/;

/*
 * Karma reporter that persists captured scenarios (emitted by
 * test/spec/capture.spec.js as `CAPTURE::name::base64` log lines) as standalone,
 * per-theme HTML documents under the configured output directory, plus a
 * side-by-side comparison index.
 *
 * Turning the HTML into screenshots is a separate follow-up step
 * (scripts/capture.js).
 */
function CaptureReporter(baseReporterDecorator, config, logger) {
  baseReporterDecorator(this);

  const log = logger.create('reporter.capture');

  const options = config.captureReporter || {};
  const outDir = path.resolve(config.basePath || '.', options.dir || '.captures');

  const captures = new Map();

  this.onBrowserLog = function(browser, message) {
    const line = typeof message === 'string' ? message : String(message);

    const match = line.match(CAPTURE_RE);

    if (!match) {
      return;
    }

    const [ , name, encoded ] = match;

    captures.set(name, Buffer.from(encoded, 'base64').toString('utf8'));
  };

  this.onRunComplete = function() {
    if (!captures.size) {
      return;
    }

    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    const names = [ ...captures.keys() ].sort();

    for (const name of names) {
      const dir = path.join(outDir, name);

      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(
        path.join(dir, 'comparison.html'),
        buildComparisonHtml(name, captures.get(name))
      );
    }

    fs.writeFileSync(path.join(outDir, 'index.html'), buildIndex(names));

    log.info(
      `saved ${names.length} scenario(s) to ${path.relative(process.cwd(), outDir)}/`
    );
  };
}

CaptureReporter.$inject = [ 'baseReporterDecorator', 'config', 'logger' ];

module.exports = {
  'reporter:capture': [ 'type', CaptureReporter ]
};
