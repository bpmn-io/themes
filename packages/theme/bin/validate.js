#!/usr/bin/env node
import process from 'node:process';

import { validate } from '../lib/validate.js';

const files = process.argv.slice(2);

if (!files.length) {
  console.error('usage: bpmn-io-theme-validate <stylesheet...>');
  process.exit(2);
}

const problems = validate(files);

for (const { file, line, message } of problems) {
  console.error(`${file}:${line}  ${message}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s) found`);
  process.exit(1);
}

console.log(`${files.length} stylesheet(s) match @bpmn-io/theme`);
