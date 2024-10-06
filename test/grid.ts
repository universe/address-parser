/* global describe, it */
import { Directional, State,StreetType } from '@universe/models';

import { compare, Fixtures } from './_util.js';

// Grid style street annotations
// https://pe.usps.com/text/pub28/28apd_003.htm
const FIXTURES: Fixtures = {
  '11935 Rd 39.2, Mancos, CO 81328': {
    number: '11935',
    streetName: '39.2',
    streetType: StreetType.RD,
    city: 'Mancos',
    state: State.CO,
    zip: '81328',
  },

  '11935 39.2 Rd, Mancos, CO 81328': {
    number: '11935',
    streetName: '39.2',
    streetType: StreetType.RD,
    city: 'Mancos',
    state: State.CO,
    zip: '81328',
  },

  '842 E 1700 S, Salt Lake City UT, 84105': {
    number: '842',
    streetPreDir: Directional.E,
    streetName: '1700',
    streetPostDir: Directional.S,
    city: 'Salt Lake City',
    state: State.UT,
    zip: '84105',
  },
};

describe('Grid Addresses', () => {
  for (const addr of Object.keys(FIXTURES)) {
    /* eslint-disable-next-line jest/expect-expect */
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
