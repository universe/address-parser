/* global describe, it */
import { State } from '@universe/models';

import { USPSLabel } from '../src/Address.js';
import { compareLabel } from './_util.js';

// Grid style street annotations
// https://pe.usps.com/text/pub28/28apd_003.htm
const FIXTURES: Record<string, Partial<USPSLabel>> = {
  '11935 Rd 39.2, Mancos, CO 81328': {
    line1: '11935 ROAD 39.2',
    line2: null,
    city: 'MANCOS',
    state: State.CO,
    zip: '81328',
  },
  '11935 39.2 Road, Mancos, CO 81328': {
    line1: '11935 ROAD 39.2',
    line2: null,
    city: 'MANCOS',
    state: State.CO,
    zip: '81328',
  },
  '11935 AVE Q, Mancos, CO 81328': {
    line1: '11935 AVENUE Q',
    line2: null,
    city: 'MANCOS',
    state: State.CO,
    zip: '81328',
  },
  '11935 Q AVE, Mancos, CO 81328': {
    line1: '11935 AVENUE Q',
    line2: null,
    city: 'MANCOS',
    state: State.CO,
    zip: '81328',
  },
  '11935 Q ST, Mancos, CO 81328': {
    line1: '11935 Q ST',
    line2: null,
    city: 'MANCOS',
    state: State.CO,
    zip: '81328',
  },
  '11935 Avenue of the Stars, Los Angeles, CA 90210': {
    line1: '11935 AVENUE OF THE STARS',
    line2: null,
    city: 'LOS ANGELES',
    state: State.CA,
    zip: '90210',
  },

  '123 Street of the Violet Lantern, Dana Point, CA 92629': {
    line1: '123 STREET OF THE VIOLET LANTERN',
    line2: null,
    city: 'DANA POINT',
    state: State.CA,
    zip: '92629',
  },
};

describe('Addresses Label Street Type Order', () => {
  for (const addr of Object.keys(FIXTURES)) {
    /* eslint-disable-next-line jest/expect-expect */
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compareLabel(addr, FIXTURES[addr]);
    });
  }
});
