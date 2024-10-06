import { aliases,FacilityType } from '@universe/models';

import { normalize, titleCase } from '../parser/utils.js';

const FacilityTypeMapping: {[key: string]: FacilityType } = {};

for (const abbr of Object.keys(aliases.FacilityType) as FacilityType[]) {
  FacilityTypeMapping[normalize(abbr)] = abbr;
  for (const val of aliases.FacilityType[abbr]) {
    FacilityTypeMapping[normalize(val)] = abbr;
  }
}

export function toFacilityType(val: string): FacilityType {
  return FacilityTypeMapping[normalize(val)];
}

export function facilityTypeString(type: FacilityType | null): string | null {
  if (type === null) {
    return null;
  }
  type = toFacilityType(type);
  return titleCase(aliases.FacilityType[normalize(type) as FacilityType][0]);
}

export function isFacilityType(val: string): val is FacilityType {
  return !!FacilityTypeMapping[normalize(val)];
}

const urbanizations = new Set([
  FacilityType.URB,
  FacilityType.EXT,
  FacilityType.MANS,
  FacilityType.EST,
  FacilityType.ALT,
  FacilityType.BDA,
  FacilityType.BO,
  FacilityType.BOSQUE,
  FacilityType.BRISA,
  FacilityType.CIUDAD,
  FacilityType.COLINA,
  FacilityType.CHALETS,
  FacilityType.COMUNIDAD,
  FacilityType.EST,
  FacilityType.EXT,
  FacilityType.HACIENDA,
  FacilityType.JARD,
  FacilityType.IND,
  FacilityType.LOMA,
  FacilityType.MANS,
  FacilityType.PARQ,
  FacilityType.PARCELA,
  FacilityType.PASEO,
  FacilityType.PRADERA,
  FacilityType.PORTAL,
  FacilityType.PORTALES,
  FacilityType.QUINTAS,
  FacilityType.RES,
  FacilityType.REPTO,
  FacilityType.RIBERAS,
  FacilityType.SECT,
  FacilityType.TERR,
  FacilityType.VALLE,
  FacilityType.VILLA,
  FacilityType.VISTA,
]);

export function isUrbanization(val: unknown): val is FacilityType {
  return urbanizations.has(toFacilityType(String(val)));
}
