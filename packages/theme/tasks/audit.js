#!/usr/bin/env node

/**
 * Validate every adopted consumer against this package at once, to see which
 * ones a token change still requires work in.
 *
 * Internal to this repository: it reads the consumer checkouts sitting next to
 * it, which only exist on a maintainer's machine. Consumers run
 * `bpmn-io-theme-validate` on themselves instead.
 *
 * Usage: npm run audit:consumers [-- <dir containing the checkouts>]
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import consumers from './consumers.js';
import { validate } from '../lib/validate.js';

// the checkouts sit next to the theme repository
const DEFAULT_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);

const root = process.argv[2] || DEFAULT_ROOT;

let checked = 0;
let drifted = 0;

for (const [ name, file ] of Object.entries(consumers)) {
  const stylesheet = path.join(root, file);

  if (!fs.existsSync(stylesheet)) {
    console.log(`  ?  ${name} — ${file} not found`);

    continue;
  }

  checked++;

  const problems = validate([ stylesheet ]);

  if (!problems.length) {
    console.log(`  ✔  ${name} — in sync`);

    continue;
  }

  drifted++;

  console.log(`  ✘  ${name} — ${problems.length} problem(s)`);

  for (const { line, message } of problems) {
    console.log(`     ${line}  ${message}`);
  }
}

// drift is the expected state right after a theme change, not a failure, so the
// audit reports rather than gates
if (!checked) {
  console.log(`\nno consumer checked out under ${root}`);
} else {
  console.log(
    drifted
      ? `\n${drifted} consumer(s) out of sync with @bpmn-io/theme`
      : '\nall consumers are in sync'
  );
}
