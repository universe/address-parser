/* global describe, it */
import { Country, State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  'I can write whatever I want here as long as the string ends with Germany': [{
    care: 'I Can Write Whatever I Want Here As Long As the String Ends With',
    country: Country.DEU,
  }, ('I can write whatever I want here as long as the string ends with').toUpperCase(), 'GERMANY' ],

  'Works with multi-word countries, New Zealand': [{
    care: 'Works With Multi-Word Countries',
    country: Country.NZL,
  }, ('Works with multi-word countries').toUpperCase(), 'NEW ZEALAND' ],

  'Country names do not work across new lines New, Zealand': [{
    care: 'Country Names Do Not Work Across New Lines New',
    city: 'Zealand',
    country: Country.USA,
  }, 'COUNTRY NAMES DO NOT WORK ACROSS NEW LINES NEW', 'ZEALAND' ],

  'Works with 3 letter codes, FRA': [{
    care: 'Works With 3 Letter Codes',
    country: Country.FRA,
  }, 'WORKS WITH 3 LETTER CODES', 'FRANCE' ],

  'Works with 2 letter codes, UK': [{
    care: 'Works With 2 Letter Codes',
    country: Country.GBR,
  }, 'WORKS WITH 2 LETTER CODES', 'UNITED KINGDOM' ],

  'Works with alternate names, Rhodesia': [{
    care: 'Works With Alternate Names',
    country: Country.ZWE,
  }, 'WORKS WITH ALTERNATE NAMES', 'ZIMBABWE' ],

  // Preserves Newlines
  'PO Box 127676\nDubai 20000\nUnited Arab Emirates': [{
    care: 'PO Box 127676\nDubai 20000',
    country: Country.ARE,
  }, 'PO BOX 127676\nDUBAI 20000', 'UNITED ARAB EMIRATES' ],

  // Avoids false positives
  '10935 TURKEY DR #410': [{
    number: '10935',
    streetName: 'Turkey',
    streetType: StreetType.DR,
    unitNum: '410',
    country: Country.USA,
  }, '10935 TURKEY DR # 410' ],

  '6605 Via Canada': [{
    care: '6605 Via',
    country: Country.CAN,
  }, '6605 VIA', 'CANADA' ],

  // Avoids false positives
  '6605 Via Canada Unit 123': [{
    number: '6605',
    streetName: 'Canada',
    streetType: StreetType.VIA,
    unitNum: '123',
    unitAbbr: UnitAbbr.UNIT,
  }, '6605 VIA CANADA UNIT 123' ],

  // Avoids false positives
  '6605 Via Canada, Rancho Palos Verdes CA, 90275': [{
    number: '6605',
    streetName: 'Canada',
    streetType: StreetType.VIA,
    city: 'Rancho Palos Verdes',
    state: State.CA,
    zip: '90275',
    country: Country.USA,
  }, '6605 VIA CANADA', 'RANCHO PALOS VERDES CA  90275' ],
};

describe('Foreign Addresses', () => {
  for (const addr of Object.keys(FIXTURES)) {
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
