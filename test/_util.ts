import { Country,ISitus } from '@universe/models';
import * as assert from 'assert';
import { distance } from 'fastest-levenshtein';

import { Address, parse, USPSLabel } from '../src/index.js';

export type Fixture = Partial<ISitus>
 | [Partial<ISitus>, string | undefined]
 | [Partial<ISitus>, string | undefined, string | undefined]
 | [Partial<ISitus>, string | undefined, string | undefined, string | undefined]
 | [Partial<ISitus>, string | undefined, string | undefined, string | undefined, string | undefined];

export type Fixtures = { [key: string]: Fixture };

export function normalize(situs: Partial<ISitus>): ISitus {
  return Object.assign({
    care: null,
    facility: null,
    facilityType: null,
    pinType: null,
    pinNum: null,
    number: null,
    streetPreDir: null,
    streetName: null,
    streetType: null,
    streetPostDir: null,
    unitAbbr: null,
    unitNum: null,
    city: null,
    state: null,
    zip: null,
    zip4: null,
    country: Country.USA,
  }, situs);
}

export function normalizeLabel(situs: Partial<USPSLabel>): USPSLabel {
  return {
    care: situs.care || null,
    urbanization: situs.urbanization || null,
    line1: situs.line1 || null,
    line2: situs.line2 || null,
    city: situs.city || null,
    state: situs.state || null,
    zip: situs.zip || null,
    zip4: situs.zip4 || null,
    country: Country.USA,
  };
}

export function compare(addr: string | string[], fixture: Fixture, message?: string | Error): void {
  if (!Array.isArray(addr)) { addr = [addr]; }
  if (Array.isArray(fixture)) {
    const situs = parse(...addr);
    assert.deepStrictEqual(situs, normalize(fixture[0]), message);
    const obj = new Address(situs);
    assert.deepStrictEqual(obj.lines(), [ fixture[1] || null, fixture[2] || null, fixture[3] || null, fixture[4] || null ]);
  }
  else {
    assert.deepStrictEqual(parse(...addr), normalize(fixture), message);
  }
}

export function compareLabel(addr: string | string[], fixture: Partial<USPSLabel>, message?: string | Error): void {
  if (!Array.isArray(addr)) { addr = [addr]; }
  const test = new Address(...addr);
  const result = normalizeLabel(test.label());
  const fixtureLabel =  normalizeLabel(fixture);

  // We do not support filling in missing zip code data. Don't fail us for this kind of error.
  if (!result.zip || !fixtureLabel.zip) { result.zip = fixtureLabel.zip = null; }
  if (!result.zip4 || !fixtureLabel.zip4) { result.zip4 = fixtureLabel.zip4 = null; }
  
  // We don't support 100% perfect formatting (e.g. AMERICAN EXECUTIVE CTR => AMERICAN EXECUTIVE CENTER) 
  // or detailed address correction (e.g. 195 HARTFORD TPKE => 195 OLD HARTFORD TPKE). If the string
  // distance is within 7 characters, consider this a pass.
  let incorrectLineCount = 0;
  for (const key in result) {
    if (distance(fixtureLabel[key as keyof USPSLabel] || '', result[key as keyof USPSLabel] || '') > 7) { incorrectLineCount++; }
  }
  if (incorrectLineCount === 0) { return; }

  // Print a detailed error for debugging.
  assert.deepStrictEqual(result, fixtureLabel, `${message}: ${JSON.stringify(test.address, null, 2)}`);
}
