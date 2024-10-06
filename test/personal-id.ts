/* global describe, it */
import { Directional, FacilityType, PersonalIdentifier, State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  // MSC Number (Mail Stop Code)
  'Bard College MSC #123456\nPO Box 5000\nAnnandale-on-Hudson, NY 12504-5000': {
    care: 'Bard College',
    facilityType: FacilityType.PO,
    pinType: PersonalIdentifier.MSC,
    pinNum: '123456',
    unitAbbr: UnitAbbr.BOX,
    unitNum: '5000',
    city: 'Annandale-on-Hudson',
    state: State.NY,
    zip: '12504',
    zip4: '5000',
  },

  'PO Box 5000 Msc # 334': {
    facilityType: FacilityType.PO,
    pinType: PersonalIdentifier.MSC,
    pinNum: '334',
    unitAbbr: UnitAbbr.BOX,
    unitNum: '5000',
  },

  '502 E Boone Ave, Gonzaga University Msc 3499, Spokane WA 99258': {
    care: 'Gonzaga University',
    number: '502',
    streetPreDir: Directional.E,
    streetName: 'Boone',
    streetType: StreetType.AVE,
    pinType: PersonalIdentifier.MSC,
    pinNum: '3499',
    city: 'Spokane',
    state: State.WA,
    zip: '99258',
  },

  // ...rando mail room numbers
  'OCMR #12345, 135 W. Lorain St.\nOberlin, OH 44074-1081': {
    care: 'Ocmr',
    pinNum: '12345',
    number: '135',
    streetPreDir: Directional.W,
    streetName: 'Lorain',
    streetType: StreetType.ST,
    city: 'Oberlin',
    state: State.OH,
    zip: '44074',
    zip4: '1081',
  },

  'OCMR 0120, Oberlin College, Oberlin, OH, 44074': {
    care: 'Oberlin College',
    facility: 'Ocmr',
    pinNum: '0120',
    city: 'Oberlin',
    state: State.OH,
    zip: '44074',
  },

  // c/o
  'Brown University, 69 Brown St # 2663 Providence RI 02912': {
    care: 'Brown University',
    city: 'Providence',
    number: '69',
    streetName: 'Brown',
    streetType: StreetType.ST,
    unitNum: '2663',
    state: State.RI,
    zip: '02912',
  },

  // Multi-line organization with custom PIN.
  // https://usm.maine.edu/sites/default/files/Mail%20Services/on%20campus%20student%20mail%20info%20C.pdf
  'University of Southern Maine\n DI-410\n 37 College Ave.\nGorham, ME 04038': {
    care: 'University of Southern Maine',
    number: '37',
    pinNum: 'DI-410',
    streetName: 'College',
    streetType: StreetType.AVE,
    city: 'Gorham',
    state: State.ME,
    zip: '04038',
  },

  'Hodgdon Hall 326, Tufts University, Medford MA 02155': {
    care: 'Tufts University',
    facility: 'Hodgdon Hall',
    pinNum: '326',
    city: 'Medford',
    state: State.MA,
    zip: '02155',
  },

  // Jail Addresses
  'Santa Rita Jail PFN#4c1492, 5325 Border Blvd': {
    care: 'Santa Rita Jail',
    number: '5325',
    streetName: 'Border',
    streetType: StreetType.BLVD,
    pinType: PersonalIdentifier.PFN,
    pinNum: '4C1492',
  },
  'Santa Rita Jail Pfn # 885, 5325 Border Blvd': {
    care: 'Santa Rita Jail',
    number: '5325',
    streetName: 'Border',
    streetType: StreetType.BLVD,
    pinType: PersonalIdentifier.PFN,
    pinNum: '885',
  },
  'Santa Rita Jail Pfn Umc417, 5325 Border Blvd': {
    care: 'Santa Rita Jail',
    number: '5325',
    streetName: 'Border',
    streetType: StreetType.BLVD,
    pinType: PersonalIdentifier.PFN,
    pinNum: 'UMC417',
  },
  'Santa Rita Jail Pfn:umb917, 532j Border Blvd': {
    care: 'Santa Rita Jail',
    pinType: PersonalIdentifier.PFN,
    pinNum: 'UMB917',
    number: '532J',
    streetName: 'Border',
    streetType: StreetType.BLVD,
  },
  'Santa Rita Jail Pfn-ull429, Dublin CA  94568': {
    care: 'Santa Rita Jail',
    pinType: PersonalIdentifier.PFN,
    pinNum: 'ULL429',
    city: 'Dublin',
    state: State.CA,
    zip: '94568',
  },
  'santa rita jail pfn.bmi 607, 5325 Broder Blvd': {
    care: 'Santa Rita Jail',
    number: '5325',
    streetName: 'Broder',
    streetType: StreetType.BLVD,
    pinType: PersonalIdentifier.PFN,
    pinNum: 'BMI 607',
  },

  'Glen Dyer Detention Facility, 550 6th St  Pfn:umb723': {
    care: 'Glen Dyer Detention Facility',
    number: '550',
    streetName: '6th',
    streetType: StreetType.ST,
    pinType: PersonalIdentifier.PFN,
    pinNum: 'UMB723',
  },

};

describe('PIN Numbers', () => {
  for (const addr of Object.keys(FIXTURES)) {
    /* eslint-disable-next-line jest/expect-expect */
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
