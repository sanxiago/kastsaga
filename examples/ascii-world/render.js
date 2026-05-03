#!/usr/bin/env node
// Deterministic ASCII renderer for a sample observation.
// Usage: node render.js [path/to/world.json]

import path from 'node:path';
import url from 'node:url';
import { loadObservation, render } from './render-lib.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const inputPath = process.argv[2] || path.join(__dirname, 'world.json');

function main() {
  const obs = loadObservation(inputPath);
  const { rows, legendLines } = render(obs);
  console.log(rows.join('\n'));
  console.log('\n' + legendLines.join('\n'));
}

main();
