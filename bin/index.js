#! /usr/bin/env node

import readline from 'readline';

import { parse } from '../dist/src/index.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const CACHE = {};

function stamp(addr) {
  // Use template string for speed – JSON.stringify is slower.
  /* eslint-disable-next-line max-len */
  return `[${addr.care ? `"${addr.care}"` : null},${addr.facility ? `"${addr.facility}"` : null},${addr.facilityType ? `"${addr.facilityType}"` : null},${addr.pinType ? `"${addr.pinType}"` : null},${addr.pinNum ? `"${addr.pinNum}"` : null},${addr.number ? `"${addr.number}"` : null},${addr.streetPreDir ? `"${addr.streetPreDir}"` : null},${addr.streetName ? `"${addr.streetName}"` : null},${addr.streetType ? `"${addr.streetType}"` : null},${addr.streetPostDir ? `"${addr.streetPostDir}"` : null},${addr.unitAbbr ? `"${addr.unitAbbr}"` : null},${addr.unitNum ? `"${addr.unitNum}"` : null},${addr.city ? `"${addr.city}"` : null},${addr.state ? `"${addr.state}"` : null},${addr.zip ? `"${addr.zip}"` : null},${addr.zip4 ? `"${addr.zip4}"` : null},${addr.country ? `"${addr.country}"` : null}]`.replaceAll("\n", '');
}

rl.on('line', (input) => {
  const lines = input.split("|");
  console.log('rec', lines.length);
  const output = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) {
      output.push(stamp({}));
      continue;
    }
    try {
      CACHE[line] = CACHE[line] || stamp(parse(line));
      output.push(CACHE[line]);
    }
    catch {
      output.push(stamp({}));
    }
  }
  console.log(`${String.fromCharCode(30)}[${output.join(',')}]\n`);
});

rl.once('close', () => {
    process.exit(0);
});

console.log(String.fromCharCode(30));
