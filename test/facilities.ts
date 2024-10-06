/* global describe, it */
import { FacilityType,State, StreetType, UnitAbbr } from '@universe/models';

import { compare, Fixtures } from './_util.js';

const FIXTURES: Fixtures = {

  // Unit in the care of line
  'Rieber Terrace Room 318a, 330 De Neve Dr, Los Angeles CA 90024': {
    city: 'Los Angeles',
    care: 'Rieber Terrace',
    number: '330',
    state: State.CA,
    streetName: 'De Neve',
    streetType: StreetType.DR,
    unitAbbr: UnitAbbr.RM,
    unitNum: '318A',
    zip: '90024',
  },

  // Strips leading 0's from facility names
  '0 Pier 39 Apt D-47\tSan Francisco CA 94133': {
    facilityType: FacilityType.PIER,
    facility: '39',
    unitAbbr: UnitAbbr.APT,
    unitNum: '47D',
    city: 'San Francisco',
    state: State.CA,
    zip: '94133',
  },

  // Facility numbers infer unit specifiers
  'Pier 39 D-47\tSan Francisco CA 94133': {
    facilityType: FacilityType.PIER,
    facility: '39',
    pinNum: 'D-47',
    city: 'San Francisco',
    state: State.CA,
    zip: '94133',
  },

  // Friggn' Yacht harbors...
  '0 Marina VLG YT HARB #105': {
    care: 'Marina Village Yacht Harbor',
    pinNum: '105',
  },

  // Friggn' Yacht harbors...
  '0 Marina VLG YT HBR FL 2 #105': {
    care: 'Marina Village Yacht Harbor',
    number: '105',
    unitAbbr: UnitAbbr.FL,
    unitNum: '2',
  },

  // Precincts
  'Pct 7817\nSan Francisco\nCA\n94101': {
    facilityType: FacilityType.PCT,
    facility: '7817',
    city: 'San Francisco',
    state: State.CA,
    zip: '94101',
  },

  // Precincts
  'Pct 7817': {
    facilityType: FacilityType.PCT,
    facility: '7817',
  },
};

describe('Facility Names', () => {
  for (const addr of Object.keys(FIXTURES)) {
    it(`${`${addr}`.replace(/\n/g, ', ')}`, () => {
      compare(addr, FIXTURES[addr]);
    });
  }
});
