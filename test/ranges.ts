/* global describe, it */
import { State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

// Ranged Street Addresses
// https://pe.usps.com/text/pub28/28apd_002.htm
// TODO: Range validation https://pe.usps.com/text/pub28/28ape_003.htm
const FIXTURES: Fixtures = {

  '3-9th Ave San Francisco Ca': {
    number: '3',
    streetName: '9th',
    streetType: StreetType.AVE,
    city: 'San Francisco',
    state: State.CA,
  },

  '350 Bay St #100-187 San Francisco Ca': {
    city: 'San Francisco',
    number: '350',
    state: State.CA,
    streetName: 'Bay',
    streetType: StreetType.ST,
    unitNum: '100-187',
  },

  '112–10 BRONX RD New York City NY 01247': {
    city: 'New York City',
    number: '112-10',
    state: State.NY,
    streetName: 'Bronx',
    streetType: StreetType.RD,
    zip: '01247',
  },

  '9 - 6th Ave Salt Lake City Utah 14110': {
    city: 'Salt Lake City',
    number: '9',
    state: State.UT,
    streetName: '6th',
    streetType: StreetType.AVE,
    zip: '14110',
  },

  '138 - 140 8th Ave San Francisco Ca': {
    city: 'San Francisco',
    number: '138-140',
    state: State.CA,
    streetName: '8th',
    streetType: StreetType.AVE,
  },

  '530 -5th Ave San Francisco Ca': {
    city: 'San Francisco',
    number: '530',
    state: State.CA,
    streetName: '5th',
    streetType: StreetType.AVE,
  },

  '3033-b Anza St San Francisco Ca': {
    city: 'San Francisco',
    number: '3033',
    state: State.CA,
    streetName: 'Anza',
    streetType: StreetType.ST,
    unitNum: 'B',
  },

  // Floor suffix
  '901 MAIN ST 16TH-FL DALLAS TX': {
    city: 'Dallas',
    number: '901',
    state: State.TX,
    streetName: 'Main',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.FL,
    unitNum: '16th',
  },

  // Ranged Letters.
  '3828 23rd St Apt M-K, San Francisco CA': {
    city: 'San Francisco',
    number: '3828',
    state: State.CA,
    streetName: '23rd',
    streetType: StreetType.ST,
    unitAbbr: UnitAbbr.APT,
    unitNum: 'M-K',
  },

  // Alphanumeric range combinations
  // https://pe.usps.com/text/pub28/28apd_004.htm
  'N6W23001 BLUEMOUND RD Waukesha WI 53186': {
    number: 'N6W23001',
    streetName: 'Bluemound',
    streetType: StreetType.RD,
    city: 'Waukesha',
    state: State.WI,
    zip: '53186',
  },

};

describe('Address Range Parser', () => {
  for (const addr of Object.keys(FIXTURES)) {
    /* eslint-disable-next-line jest/expect-expect */
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
