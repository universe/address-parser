/* global describe, it */
import { State } from '@universe/models';

import { compare, Fixtures } from './_util.js';

// Fractional Addresses
// https://pe.usps.com/text/pub28/28apd_005.htm
const FIXTURES: Fixtures = {

  '424 1/2 San Carlos\nNovato Ca': {
    city: 'Novato',
    number: '424 1/2',
    state: State.CA,
    streetName: 'San Carlos',
  },

};

describe('Fractional Addresses', () => {
  for (const addr of Object.keys(FIXTURES)) {
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
