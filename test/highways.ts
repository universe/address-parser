/* global describe, it */
import { Directional,State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {
  '* 19000 FM N 973 RD UNIT 11, COUPLAND TX 78615': {
    city: 'Coupland',
    state: State.TX,
    number: '19000',
    streetPostDir: Directional.N,
    streetType: StreetType.FM,
    unitAbbr: UnitAbbr.UNIT,
    unitNum: '11',
    zip: '78615',
  },

  '* 8000 W 290 US HWY APT 10409, AUSTIN TX 78736': {
    city: 'Austin',
    state: State.TX,
    number: '8000',
    streetPostDir: Directional.W,
    streetType: StreetType.HWY,
    unitAbbr: UnitAbbr.APT,
    unitNum: '10409',
    zip: '78736',
  },

  '* 8000 US HWY 290 W APT 10409, AUSTIN TX 78736': {
    city: 'Austin',
    state: State.TX,
    number: '8000',
    streetPostDir: Directional.W,
    streetType: StreetType.HWY,
    unitAbbr: UnitAbbr.APT,
    unitNum: '10409',
    zip: '78736',
  },

};

describe('Highway Address Parser', () => {
  for (const addr of Object.keys(FIXTURES)) {
    if (addr.startsWith('* ')) {
      /* eslint-disable-next-line */
      it.skip(`${addr.slice(2).replace(/\n/g, ', ')}`)
      continue;
    }

    /* eslint-disable-next-line jest/expect-expect */
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
