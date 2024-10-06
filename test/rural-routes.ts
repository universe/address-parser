/* global describe, it */
import { PersonalIdentifier, State, StreetType,UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  // PMB Number w/ Bonus Rural Route
  'PMB 234, RR 1 BOX 2, HERNDON VA 22071-2716': {
    streetType: StreetType.RR,
    streetName: '1',
    pinType: PersonalIdentifier.PMB,
    pinNum: '234',
    unitAbbr: UnitAbbr.BOX,
    unitNum: '2',
    city: 'Herndon',
    state: State.VA,
    zip: '22071',
    zip4: '2716',
  },

  // PMB Number w/ Bonus Rural Route
  'RR 1 BOX 2 #234, HERNDON VA 22071-2716': {
    streetType: StreetType.RR,
    streetName: '1',
    number: '234',
    unitAbbr: UnitAbbr.BOX,
    unitNum: '2',
    city: 'Herndon',
    state: State.VA,
    zip: '22071',
    zip4: '2716',
  },

  // PMB Number w/ Bonus Rural Route
  'RR03 BOX 2, HERNDON VA 22071-2716': {
    streetType: StreetType.RR,
    streetName: '3',
    unitAbbr: UnitAbbr.BOX,
    unitNum: '2',
    city: 'Herndon',
    state: State.VA,
    zip: '22071',
    zip4: '2716',
  },

};

describe('PIN Numbers', () => {
  for (const addr of Object.keys(FIXTURES)) {
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
