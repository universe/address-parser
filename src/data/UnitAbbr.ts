import { aliases,UnitAbbr } from '@universe/models';

import { normalize } from '../parser/utils.js';

export const UnitAbbrsMappings: { [key: string]: UnitAbbr } = {};
for (const abbr of Object.keys(aliases.UnitAbbr) as UnitAbbr[]) {
  UnitAbbrsMappings[normalize(abbr)] = abbr;
  for (const str of aliases.UnitAbbr[abbr]) {
    UnitAbbrsMappings[normalize(str)] = abbr;
  }
}

export function toUnitAbbr(abbr: string): UnitAbbr {
  return UnitAbbrsMappings[normalize(abbr)];
}

export function unitAbbrString(abbr: UnitAbbr | null): string | null {
  if (abbr === null) { return null; }
  abbr = toUnitAbbr(abbr);
  return aliases.UnitAbbr[abbr][0];
}

export function isUnitAbbr(abbr: string): abbr is UnitAbbr {
  return !!UnitAbbrsMappings[normalize(abbr)];
}

export function isUnitEnum(abbr: string): abbr is UnitAbbr {
  return !!aliases.UnitAbbr[abbr.toUpperCase() as UnitAbbr];
}
