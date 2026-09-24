#!/usr/bin/env node

/**
 * Validate every adopted consumer against this package at once, to see which
 * ones a token change still requires work in.
 *
 * Internal to this repository: it reads the consumers installed here, so it
 * reports the versions this repository actually resolves — published ones, or a
 * checkout where the consumer is linked. Consumers run `bpmn-io-theme-validate`
 * on themselves instead.
 *
 * Usage: npm run audit:consumers [-- <dir holding node_modules>]
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import consumers from './consumers.js';
import { validate } from '../lib/validate.js';

// the consumers are installed in the theme repository's own node_modules
const DEFAULT_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

const root = process.argv[2] || DEFAULT_ROOT;

function describe(name, packageRoot) {
  const manifest = path.join(packageRoot, 'package.json');

  if (!fs.existsSync(manifest)) {
    return name;
  }

  const { version } = JSON.parse(fs.readFileSync(manifest, 'utf8'));

  // a linked consumer is a working tree, not the published artifact
  const linked = fs.lstatSync(packageRoot).isSymbolicLink();

  return `${name}@${version}${linked ? ' (linked)' : ''}`;
}

let checked = 0;
let drifted = 0;

for (const [ name, file ] of Object.entries(consumers)) {
  const packageRoot = path.join(root, 'node_modules', name);
  const stylesheet = path.join(packageRoot, file);

  if (!fs.existsSync(stylesheet)) {
    console.log(`  ?  ${name} — ${file} not found, is it installed?`);

    continue;
  }

  checked++;

  const problems = validate([ stylesheet ]);

  if (!problems.length) {
    console.log(`  ✔  ${describe(name, packageRoot)} — in sync`);

    continue;
  }

  drifted++;

  console.log(`  ✘  ${describe(name, packageRoot)} — ${problems.length} problem(s)`);

  for (const { line, message } of problems) {
    console.log(`     ${line}  ${message}`);
  }
}

// drift is the expected state right after a theme change, not a failure, so the
// audit reports rather than gates
if (!checked) {
  console.log(`\nno consumer installed under ${root}`);
} else {
  console.log(
    drifted
      ? `\n${drifted} consumer(s) out of sync with @bpmn-io/theme`
      : '\nall consumers are in sync'
  );
}
