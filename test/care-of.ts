/* global describe, it */
import { Directional, FacilityType, State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  'GENERAL DELIVERY 391 ELLIS ST\t"San Francisco, CA 94104"': {
    care: 'General Delivery',
    number: '391',
    streetName: 'Ellis',
    streetType: StreetType.ST,
    city: 'San Francisco',
    state: State.CA,
    zip: '94104',
  },

  'OCMR 0120, Oberlin College, Oberlin, OH, 44074': {
    care: 'Oberlin College',
    facility: 'Ocmr',
    pinNum: '0120',
    city: 'Oberlin',
    state: State.OH,
    zip: '44074',
  },

  'Village C RHO, Harbin Hall 103, Georgetown University, 3700 O St. NW, Washington, DC 20057': {
    care: 'Georgetown University',
    facility: 'Village C, Harbin Hall',
    facilityType: FacilityType.RHO,
    pinNum: '103',
    number: '3700',
    streetName: 'O',
    streetType: StreetType.ST,
    streetPostDir: Directional.NW,
    city: 'Washington',
    state: State.DC,
    zip: '20057',
  },

  // c/o
  'c/o Prisoner Legal Services, 425 7th St, Mailroom, San Francisco, CA 94103': {
    care: 'Prisoner Legal Services',
    facilityType: FacilityType.MLRM,
    city: 'San Francisco',
    number: '425',
    streetName: '7th',
    streetType: StreetType.ST,
    state: State.CA,
    zip: '94103',
  },

  'c/o Prisoner Legal Services\n425 7th St Mailroom': {
    care: 'Prisoner Legal Services',
    facilityType: FacilityType.MLRM,
    number: '425',
    streetName: '7th',
    streetType: StreetType.ST,
  },

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

  'Hodgdon Hall 326, Tufts University, Medford MA 02155': {
    care: 'Tufts University',
    facility: 'Hodgdon Hall',
    pinNum: '326',
    city: 'Medford',
    state: State.MA,
    zip: '02155',
  },

  'PEACHTREE & CLUB APTS, 1398 CROSS KYS DR NE, ATLANTA GA 30319': {
    care: 'Peachtree & Club Apts',
    number: '1398',
    streetName: 'Cross Keys',
    streetType: StreetType.DR,
    streetPostDir: Directional.NE,
    city: 'Atlanta',
    state: State.GA,
    zip: '30319',
  },

  'St Annes Residence Hall Maxwell Ceron\n2299 Golden Gate Ave Room 217\nSan Francisco CA 94118': {
    care: 'St Annes Residence Hall Maxwell Ceron',
    number: '2299',
    streetName: 'Golden Gate',
    streetType: StreetType.AVE,
    unitAbbr: UnitAbbr.RM,
    unitNum: '217',
    city: 'San Francisco',
    state: State.CA,
    zip: '94118',
  },

  '300 North College Street, Northfield MN, 55057': {
    number: '300',
    streetPreDir: Directional.N,
    streetName: 'College',
    streetType: StreetType.ST,
    city: 'Northfield',
    state: State.MN,
    zip: '55057',
  },

};

describe('"Care Of" Business Addresses', () => {
  for (const addr of Object.keys(FIXTURES)) {
    /* eslint-disable-next-line jest/expect-expect */
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
