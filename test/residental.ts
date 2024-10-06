/* global describe, it */
import { Directional, State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  '211 OLIVER ST BUENA VISTA 31803': {
    number: '211',
    streetName: 'Oliver',
    streetType: StreetType.ST,
    city: 'Buena Vista',
    zip: '31803',
  },

  '211 OLIVER ST BUENA VISTA GA 31803': {
    number: '211',
    streetName: 'Oliver',
    streetType: StreetType.ST,
    city: 'Buena Vista',
    zip: '31803',
    state: State.GA,
  },

  '355 01st St': {
    number: '355',
    streetName: '1st',
    streetType: StreetType.ST,
  },

  '4 Embarcadero Center Suite550, San Francisco, CA 94111': {
    number: '4',
    streetName: 'Embarcadero',
    streetType: StreetType.CTR,
    unitAbbr: UnitAbbr.STE,
    unitNum: '550',
    city: 'San Francisco',
    state: State.CA,
    zip: '94111',
  },

  '150 4th Ave N 20th FL\nNashville TN 37219': {
    number: '150',
    streetName: '4th',
    streetType: StreetType.AVE,
    streetPostDir: Directional.N,
    unitAbbr: UnitAbbr.FL,
    unitNum: '20th',
    city: 'Nashville',
    state: State.TN,
    zip: '37219',
  },

  '150 4th Ave N\n20th FL\nNashville TN 37219': {
    number: '150',
    streetName: '4th',
    streetType: StreetType.AVE,
    streetPostDir: Directional.N,
    unitAbbr: UnitAbbr.FL,
    unitNum: '20th',
    city: 'Nashville',
    state: State.TN,
    zip: '37219',
  },

  '870 N Point St #301 San Francisco Ca': {
    number: '870',
    streetPreDir: Directional.N,
    streetName: 'Point',
    streetType: StreetType.ST,
    unitNum: '301',
    city: 'San Francisco',
    state: State.CA,
  },

  '10 Main Street S Apt. 524': {
    number: '10',
    streetName: 'Main',
    streetType: StreetType.ST,
    streetPostDir: Directional.S,
    unitAbbr: UnitAbbr.APT,
    unitNum: '524',
  },

  '10 Main Street #421b': {
    number: '10',
    streetName: 'Main',
    streetType: StreetType.ST,
    unitNum: '421B',
  },

  '10 Main Street b421': {
    number: '10',
    streetName: 'Main',
    streetType: StreetType.ST,
    unitNum: '421B',
  },

  '870 North Point St #302 San Francisco Ca': {
    city: 'San Francisco',
    number: '870',
    state: State.CA,
    streetName: 'Point',
    streetPreDir: Directional.N,
    streetType: StreetType.ST,
    unitNum: '302',
  },

  '6550 Sw 63rd Ave Portland Or': {
    city: 'Portland',
    number: '6550',
    state: State.OR,
    streetName: '63rd',
    streetPreDir: Directional.SW,
    streetType: StreetType.AVE,
  },

  '838a North Point St San Francisco Ca': {
    city: 'San Francisco',
    number: '838A',
    state: State.CA,
    streetName: 'Point',
    streetPreDir: Directional.N,
    streetType: StreetType.ST,
  },

  '1301 Marina Vill Parkwy#240 Alameda Ca': {
    city: 'Alameda',
    number: '1301',
    state: State.CA,
    streetName: 'Marina Village',
    streetType: StreetType.PKWY,
    unitNum: '240',
  },

  '8724 N 192nd Ave Waddell Az': {
    city: 'Waddell',
    number: '8724',
    state: State.AZ,
    streetName: '192nd',
    streetPreDir: Directional.N,
    streetType: StreetType.AVE,
  },

  '4 Aster Ter, Key West Fl': {
    city: 'Key West',
    number: '4',
    state: State.FL,
    streetName: 'Aster',
    streetType: StreetType.TER,
  },

  '15149 W Black Gold Ln Sun City West Az': {
    city: 'Sun City West',
    number: '15149',
    state: State.AZ,
    streetName: 'Black Gold',
    streetPreDir: Directional.W,
    streetType: StreetType.LN,
  },

  '217 No Lake Merced Hill': {
    number: '217',
    streetName: 'Lake Merced',
    streetPreDir: Directional.N,
    streetType: StreetType.HL,
  },

  '501 Ashbury St No 2 San Francisco Ca': {
    city: 'San Francisco',
    number: '501',
    state: State.CA,
    streetName: 'Ashbury',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.NO,
    unitNum: '2',
  },

  '424 San Carlos\nNovato Ca': {
    city: 'Novato',
    number: '424',
    state: State.CA,
    streetName: 'San Carlos',
  },

  '649 First St W #29 Sonoma Ca 94109': {
    city: 'Sonoma',
    number: '649',
    state: State.CA,
    streetName: '1st',
    streetPostDir: Directional.W,
    streetType: StreetType.ST,
    unitNum: '29',
    zip: '94109',
  },

  '649 A First St Sonoma Ca 94109': {
    city: 'Sonoma',
    number: '649',
    state: State.CA,
    streetName: '1st',
    streetType: StreetType.ST,
    unitNum: 'A',
    zip: '94109',
  },

  '424 1/2 San Carlos\nNovato Ca': {
    city: 'Novato',
    number: '424 1/2',
    state: State.CA,
    streetName: 'San Carlos',
  },

  '145 JEFFERSON ST SUITE 700\n SAN FRANCISCO CA': {
    city: 'San Francisco',
    number: '145',
    state: State.CA,
    streetName: 'Jefferson',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.STE,
    unitNum: '700',
  },

  // No Street Suffix, multi-part city name
  '113 Topaz\nSan Francisco CA': {
    city: 'San Francisco',
    number: '113',
    state: State.CA,
    streetName: 'Topaz',
  },

  // No Street Suffix
  '469 W Huron 1508\nChicago IL': {
    city: 'Chicago',
    number: '469',
    state: State.IL,
    streetName: 'Huron',
    streetPreDir: Directional.W,
    unitNum: '1508',
  },

  // Apartment letter is a directional
  '890 El Camino Del Mar Apt S': {
    number: '890',
    streetName: 'Del Mar',
    streetType: StreetType.ECAM,
    unitAbbr: UnitAbbr.APT,
    unitNum: 'S',
  },

  // User Error: Street name is directional
  '203 S St, Sacramento CA': {
    city: 'Sacramento',
    number: '203',
    state: State.CA,
    streetName: 'S',
    streetType: StreetType.ST,
  },

  // User Error: Street number not prefixed
  'S St 203, Sacramento CA': {
    city: 'Sacramento',
    number: '203',
    state: State.CA,
    streetName: 'S',
    streetType: StreetType.ST,
  },

  /* eslint-disable-next-line no-tabs */
  '120 Jasper Pl Apt 2ND FL, San Francisco	CA': {
    city: 'San Francisco',
    number: '120',
    state: State.CA,
    streetName: 'Jasper',
    streetType: StreetType.PL,
    unitAbbr: UnitAbbr.FL,
    unitNum: '2nd',
  },

  // Common corner case, duplicate unit specifier.
  '3828 23rd St Apt A APT A, San Francisco CA': {
    city: 'San Francisco',
    number: '3828',
    state: State.CA,
    streetName: '23rd',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: 'A',
  },

  // Common corner case, duplicate unit specifier.
  '3828 23rd St Apt S511 A': {
    number: '3828',
    streetName: '23rd',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '511S A',
  },

  // Common corner case, duplicate unit specifier.
  '3828 23rd St Apt 511S A': {
    number: '3828',
    streetName: '23rd',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '511S A',
  },

  // Common corner case, double unit specifier.
  '3828 23rd St Apt 1 PH, San Francisco CA': {
    city: 'San Francisco',
    number: '3828',
    state: State.CA,
    streetName: '23rd',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.PH,
    unitNum: '1',
  },

  // Common corner case, duplicate unit abbr in unit number.
  /* eslint-disable-next-line no-tabs */
  '4475 24th St Apt APT1	San Francisco CA': {
    city: 'San Francisco',
    number: '4475',
    state: State.CA,
    streetName: '24th',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '1',
  },

  // Common corner case, unit type in same string as prefix.
  '4475 24th St PH1 San Francisco CA': {
    city: 'San Francisco',
    number: '4475',
    state: State.CA,
    streetName: '24th',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.PH,
    unitNum: '1',
  },

  // Common corner case, unit type in same string as suffix.
  '4475 24th St 1PH San Francisco CA': {
    city: 'San Francisco',
    number: '4475',
    state: State.CA,
    streetName: '24th',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.PH,
    unitNum: '1',
  },

  // Common corner case, duplicated unit wth different type
  '1010 Jamestown Ave Apt B UNIT B, San Francisco, CA': {
    city: 'San Francisco',
    number: '1010',
    state: State.CA,
    streetName: 'Jamestown',
    streetType: StreetType.AVE,
    unitAbbr: UnitAbbr.UNIT,
    unitNum: 'B',
  },

  // Single letter street names
  '301 H St Apt 105, San Francisco, CA': {
    city: 'San Francisco',
    number: '301',
    state: State.CA,
    streetName: 'H',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '105',
  },

  // Ordinal street names
  '301 12th St Apt 105, San Francisco, CA': {
    city: 'San Francisco',
    number: '301',
    state: State.CA,
    streetName: '12th',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '105',
  },

  // Street Suffix is actually a prefix...
  '2000 Ave Of The Stars 1020 Los Angeles CA': {
    city: 'Los Angeles',
    number: '2000',
    state: State.CA,
    streetName: 'of the Stars',
    streetType: StreetType.AVE,
    unitNum: '1020',
  },

  // City is also a state name
  '2000 A St, Washington DC 12345': {
    city: 'Washington',
    number: '2000',
    state: State.DC,
    streetName: 'A',
    streetType: StreetType.ST,
    zip: '12345',
  },

  // Street Suffix is actually a prefix...
  '10 Hwy 100 Unit 10, Los Angeles CA': {
    city: 'Los Angeles',
    number: '10',
    state: State.CA,
    streetName: '100',
    streetType: StreetType.HWY,
    unitAbbr: UnitAbbr.UNIT,
    unitNum: '10',
  },

  // Number in street name
  '* 24 Loop 22 St': {
    number: '24',
    streetName: 'Loop 22',
    streetType: StreetType.ST,
  },

  '100 Spring ST Apt UNIT Charles, San Francisco, CA': {
    city: 'San Francisco',
    number: '100',
    state: State.CA,
    streetName: 'Spring',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.UNIT,
    unitNum: 'Charles',
  },

  '326 12th Ave # 3 APT 3, San Francisco, CA 94109': {
    city: 'San Francisco',
    number: '326',
    state: State.CA,
    streetName: '12th',
    streetType: StreetType.AVE,
    unitAbbr: UnitAbbr.APT,
    unitNum: '3',
    zip: '94109',
  },

  '201 Waller St Apt 303 PH L, San Francisco, CA 94109': {
    city: 'San Francisco',
    number: '201',
    state: State.CA,
    streetName: 'Waller',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.PH,
    unitNum: 'L',
    zip: '94109',
  },

  'W3759 HIGHVIEW DR, APPLETON, WI 54913': {
    city: 'Appleton',
    number: 'W3759',
    state: State.WI,
    streetName: 'Highview',
    streetType: StreetType.DR,
    zip: '54913',
  },

  // Multiple units chooses last one
  '1359 Pine St Apt 3RD FL R, San Francisco, CA 94109': {
    city: 'San Francisco',
    number: '1359',
    state: State.CA,
    streetName: 'Pine',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.FL,
    unitNum: 'R',
    zip: '94109',
  },

  // Unit preceding
  'Box # 1142 700 Commonwealth Avenue, Boston MA 02215': {
    city: 'Boston',
    number: '700',
    streetName: 'Commonwealth',
    streetType: StreetType.AVE,
    unitAbbr: UnitAbbr.BOX,
    unitNum: '1142',
    state: State.MA,
    zip: '02215',
  },

  // Zip+4
  '1 LUMANAI BLDG, PAGO PAGO, AS 96799-9994': {
    number: '1',
    streetName: 'Lumanai',
    unitAbbr: UnitAbbr.BLDG,
    city: 'Pago Pago',
    state: State.AS,
    zip: '96799',
    zip4: '9994',
  },

  // Multiple unit numbers
  'ARKUS AND HAMILTON MD, 392 CENTRAL AVE # 5138 # 2268, JERSEY CITY NJ 07307': {
    care: 'Arkus and Hamilton Md',
    city: 'Jersey City',
    number: '392',
    state: State.NJ,
    streetName: 'Central',
    streetType: StreetType.AVE,
    unitNum: '5138 # 2268',
    zip: '07307',
  },

  // Directional unit numbers
  '25 Sierra St. Apt #123 East': {
    number: '25',
    streetName: 'Sierra',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '123E',
  },

  // Directional unit numbers
  '25 Sierra St. Apt #123 SW': {
    number: '25',
    streetName: 'Sierra',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '123SW',
  },

  // Directional unit numbers
  '25 Sierra St. Apt East 123': {
    number: '25',
    streetName: 'Sierra',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: '123E',
  },

  // Accidental street directional after newline.
  '* 1900 F St, NW Unit 702\nWashington, DC 20052': {
    city: 'Washington',
    number: '1900',
    state: State.DC,
    streetName: 'F',
    streetType: StreetType.ST,
    streetPostDir: Directional.NW,
    unitAbbr: UnitAbbr.UNIT,
    unitNum: '702',
    zip: '20052',
  },

  // Multiple street suffixes.
  '123 Alta Vista Way': {
    number: '123',
    streetName: 'Alta Vista',
    streetType: StreetType.WAY,
  },

  // Multiple street suffixes.
  '123 Alta Calle Way': {
    number: '123',
    streetName: 'Alta Calle',
    streetType: StreetType.WAY,
  },

  '300 H\nBENICIA, CA 94510': {
    number: '300',
    streetName: 'H',
    city: 'Benicia',
    state: State.CA,
    zip: '94510',
  },

  '230 K\nBENICIA, CA NO ZIP': {
    number: '230',
    streetName: 'K',
    city: 'Benicia',
    state: State.CA,
  },

  '300 H Apt: 111\nBENICIA, CA 94510': {
    number: '300',
    streetName: 'H',
    unitAbbr: UnitAbbr.APT,
    unitNum: '111',
    city: 'Benicia',
    state: State.CA,
    zip: '94510',
  },

  '200 CARD AL': {
    number: '200',
    streetName: 'Card',
    streetType: StreetType.ALY,
  },

  '* 200 AVENUE N': {
    number: '200',
    streetName: 'N',
    streetType: StreetType.AVE,
  },
};

describe('Residential Addresses', () => {
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
