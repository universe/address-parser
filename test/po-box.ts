/* global describe, it */
import { FacilityType,State, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  // PO Boxes
  'PO Box 884, Loon Lake WA 99148': [{
    city: 'Loon Lake',
    facilityType: FacilityType.PO,
    state: State.WA,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '884',
    zip: '99148',
  }, 'PO BOX 884', 'LOON LAKE WA  99148' ],

  'P.O. Box 884, Loon Lake WA 99148': [{
    city: 'Loon Lake',
    facilityType: FacilityType.PO,
    state: State.WA,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '884',
    zip: '99148',
  }, 'PO BOX 884', 'LOON LAKE WA  99148' ],

  'P.o Box 884, Loon Lake WA 99148': [{
    city: 'Loon Lake',
    facilityType: FacilityType.PO,
    state: State.WA,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '884',
    zip: '99148',
  }, 'PO BOX 884', 'LOON LAKE WA  99148' ],

  'P.OBox 884, Loon Lake WA 99148': [{
    city: 'Loon Lake',
    facilityType: FacilityType.PO,
    state: State.WA,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '884',
    zip: '99148',
  }, 'PO BOX 884', 'LOON LAKE WA  99148' ],

  'P.O Box L, Loon Lake WA 99148': [{
    city: 'Loon Lake',
    facilityType: FacilityType.PO,
    state: State.WA,
    unitAbbr: UnitAbbr.BOX,
    unitNum: 'L',
    zip: '99148',
  }, 'PO BOX L', 'LOON LAKE WA  99148' ],

  'P.O Box 123 345, Loon Lake WA 99148': [{
    city: 'Loon Lake',
    facilityType: FacilityType.PO,
    state: State.WA,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '123345',
    zip: '99148',
  }, 'PO BOX 123345', 'LOON LAKE WA  99148' ],

  'P.O Box 123-ABC, Loon Lake WA 99148': [{
    city: 'Loon Lake',
    facilityType: FacilityType.PO,
    state: State.WA,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '123ABC',
    zip: '99148',
  }, 'PO BOX 123ABC', 'LOON LAKE WA  99148' ],

  // Un-needed country specification on American territory
  'PO Box 6708, Pago Pago As 96799 Samoa': [{
    facilityType: FacilityType.PO,
    state: State.AS,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '6708',
    city: 'Pago Pago',
    zip: '96799',
  }, 'PO BOX 6708', 'PAGO PAGO AS  96799' ],

};

describe('PO Box Address Parser', () => {
  for (const addr of Object.keys(FIXTURES)) {
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
