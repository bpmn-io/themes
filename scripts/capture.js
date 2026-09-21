#!/usr/bin/env node
/*
 * Per-scenario theme comparison captures.
 *
 * Scenarios are the specs themselves: this runs the real suite in retained mode
 * (headless) and the `capture` karma reporter saves each mounted panel as
 * standalone, per-theme HTML under `.captures/` (plus a side-by-side index).
 *
 * As a follow-up, the saved HTML is rendered to PNGs with headless Chrome.
 *
 * Usage:
 *   node scripts/capture.js                       # all scenarios, html + png
 *   node scripts/capture.js --grep "execution"    # select scenarios (mocha grep)
 *   node scripts/capture.js --no-shots            # export html only, skip pngs
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.captures');

function parseArgs(argv) {
  const args = { grep: null, shots: true };

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--grep') {
      args.grep = argv[++i];
    } else if (argv[i] === '--no-shots') {
      args.shots = false;
    }
  }

  return args;
}

function exportScenarios(grep) {
  console.log('> rendering scenarios (retained, headless) ...');

  const env = Object.assign({}, process.env, {
    SINGLE_START: 'all',
    CAPTURE: '1'
  });

  const args = [ 'karma', 'start', 'test/capture/karma.capture.cjs' ];

  // forwarded to mocha by the tldr reporter
  if (grep) {
    args.push('--grep', grep);
  }

  execFileSync('npx', args, { cwd: ROOT, env, stdio: 'inherit' });
}

function findChrome() {
  return process.env.CHROME_BIN || 'chrome';
}

// background of the comparison page; used as the trim/margin color
const BG = '#e4e4e7';

function findTrimmer() {
  for (const bin of [ 'magick', 'convert' ]) {
    try {
      execFileSync(bin, [ '-version' ], { stdio: 'ignore' });
      return bin;
    } catch (err) {

      // not available, try next
    }
  }

  return null;
}

// best-effort: crop the fixed-size screenshot down to its content (+ margin)
function trim(bin, pngFile) {
  if (!bin) {
    return;
  }

  try {
    execFileSync(bin, [
      pngFile,
      '-fuzz', '2%',
      '-trim',
      '-bordercolor', BG,
      '-border', '24',
      '+repage',
      pngFile
    ], { stdio: 'ignore' });
  } catch (err) {

    // leave the untrimmed screenshot in place
  }
}

function screenshotAll() {
  const chrome = findChrome();
  const trimmer = findTrimmer();

  if (!fs.existsSync(OUT)) {
    return;
  }

  const scenarios = fs.readdirSync(OUT, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  let count = 0;

  for (const name of scenarios) {
    const htmlFile = path.join(OUT, name, 'comparison.html');

    if (!fs.existsSync(htmlFile)) {
      continue;
    }

    const pngFile = path.join(OUT, `${name}.png`);

    try {
      execFileSync(chrome, [
        '--headless',
        '--no-sandbox',
        '--hide-scrollbars',
        '--force-device-scale-factor=2',

        // a viewport screenshot, so the window must fit every theme column —
        // `3 * cell + 80`, the dmn decision table being the widest at ~1040px.
        // trimming below is best-effort and only runs when ImageMagick is around
        '--window-size=3300,2600',
        `--screenshot=${pngFile}`,
        htmlFile
      ], { stdio: 'ignore' });
    } catch (err) {
      throw new Error(
        `failed to screenshot with "${chrome}" (set CHROME_BIN to a Chrome/Chromium ` +
        `binary, or pass --no-shots to export HTML only): ${err.message}`
      );
    }

    trim(trimmer, pngFile);

    count++;
  }

  console.log(`> rendered ${count} comparison image(s)`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  exportScenarios(args.grep);

  if (!fs.existsSync(path.join(OUT, 'index.html'))) {
    console.error('No scenarios captured (check --grep).');
    process.exit(1);
  }

  if (args.shots) {
    screenshotAll();
  }

  console.log(`\nDone. Open ${path.relative(process.cwd(), path.join(OUT, 'index.html'))} to compare.`);
}

main();
