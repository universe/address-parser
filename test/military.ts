/* global describe, it */
import { FacilityType,State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  // Military Addresses
  // https://support.shippingeasy.com/hc/en-us/articles/203085299-How-to-Format-Military-mail-addresses
  'UNIT 2050 BOX 4190, APO AP 96278': {
    facilityType: FacilityType.UMR,
    facility: '2050',
    city: 'APO',
    state: State.AP,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '4190',
    zip: '96278',
  },

  'PSC 802 BOX 74, APO AE 09499': {
    facilityType: FacilityType.PSC,
    facility: '802',
    state: State.AE,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '74',
    city: 'APO',
    zip: '09499',
  },

  'USCGC HAMILTON, FPO AP 96667': {
    facilityType: FacilityType.USCGC,
    facility: 'Hamilton',
    city: 'FPO',
    state: State.AP,
    zip: '96667',
  },

  'Uss John C Stennis, Box 50 Supply Dept, Fpo, Ap 96615': {
    facilityType: FacilityType.USS,
    facility: 'John C Stennis, Supply Department',
    unitAbbr: UnitAbbr.BOX,
    unitNum: '50',
    city: 'FPO',
    state: State.AP,
    zip: '96615',
  },

  'CMR 1250, APO AA 09045': {
    facilityType: FacilityType.CMR,
    facility: '1250',
    city: 'APO',
    state: State.AA,
    zip: '09045',
  },

  '140 Phantom St Unit 16332, Keesler AFB MS 39534': {
    number: '140',
    streetName: 'Phantom',
    city: 'Keesler AFB',
    state: State.MS,
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.UNIT,
    unitNum: '16332',
    zip: '39534',
  },

  '* 220 Peacekeeper Pl Unit 2512 Dorm 214, Minot Afb ND 58705': {
    number: '220',
    streetName: 'Peacekeeper',
    state: State.ND,
    streetType: StreetType.PL,
    facilityType: FacilityType.UMR,
    facility: '2512',
    unitAbbr: UnitAbbr.DORM,
    unitNum: '214',
    city: 'Minot AFB',
    zip: '58705',
  },

  // Screwed Up Military PO Box
  '721 New Mexico Ave PO 1915, Holloman AFB NM 88330': {
    number: '721',
    streetName: 'New Mexico',
    state: State.NM,
    streetType: StreetType.AVE,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '1915',
    city: 'Holloman AFB',
    zip: '88330',
  },

};

describe('Military Address Parser', () => {
  for (const addr of Object.keys(FIXTURES)) {
    if (addr.startsWith('* ')) {
      /* eslint-disable-next-line */
      it.skip(`${addr.slice(2).replace(/\n/g, ', ')}`)
      continue;
    }

    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
