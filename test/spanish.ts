/* global describe, it */
import { State, StreetType } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {
  // Gives priority to street names over country abbreviations
  '* 755 EL CAMINO DEL MAR': [{
    number: '755',
    streetName: 'Del Mar',
    streetType: StreetType.ECAM,
  }, '755 EL CAMINO DEL MAR' ],

  // PMB Number w/ Bonus Rural Route
  '123 El Camino Real': [{
    number: '123',
    streetType: StreetType.ECAM,
    streetName: 'Real',
  }, '123 EL CAMINO REAL' ],

  // Gendered Prefix
  '158 Rancho Guapo, South San Francisco CA  94080': [{
    streetType: StreetType.RCH,
    streetName: 'Guapo',
    number: '158',
    city: 'South San Francisco',
    state: State.CA,
    zip: '94080',
  }, '158 RANCHO GUAPO', 'SOUTH SAN FRANCISCO CA  94080' ],

  // Gendered Prefix
  '158 El Rancho Dr, South San Francisco CA  94080': [{
    streetType: StreetType.ERCH,
    streetName: 'Dr',
    number: '158',
    city: 'South San Francisco',
    state: State.CA,
    zip: '94080',
  }, '158 EL RANCHO DR', 'SOUTH SAN FRANCISCO CA  94080' ],

};

describe('Spanish Names', () => {
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
