import { aliases,StreetType } from '@universe/models';

import { normalize, titleCase } from '../parser/utils.js';

export const StreetTypeMapping: {[key: string]: StreetType } = {};

for (const abbr of Object.keys(aliases.StreetType) as StreetType[]) {
  StreetTypeMapping[normalize(abbr)] = abbr;
  for (const val of aliases.StreetType[abbr]) {
    StreetTypeMapping[normalize(val)] = abbr;
  }
}

export function toStreetType(val: string): StreetType {
  return StreetTypeMapping[normalize(val)];
}

const StreetPrefixes = new Set([
  StreetType.HC,
  StreetType.FM,
  StreetType.RR,
  StreetType.SR,
  StreetType.CR,
  StreetType.TSR,

  StreetType.CLL,
  StreetType.CMT,
  StreetType.CAM,
  StreetType.CER,
  StreetType.ENT,
  StreetType.PSO,
  StreetType.PLA,
  StreetType.RCH,
  StreetType.VER,
  StreetType.VIA,

  StreetType.LCMT,
  StreetType.ECAM,
  StreetType.LCER,
  StreetType.LENT,
  StreetType.EPSO,
  StreetType.LPLA,
  StreetType.ERCH,
  StreetType.LVER,
]);

const SpanishPrefixes = new Set([
  StreetType.CLL,
  StreetType.CMT,
  StreetType.CAM,
  StreetType.CER,
  StreetType.ENT,
  StreetType.PSO,
  StreetType.PLA,
  StreetType.RCH,
  StreetType.VER,
  StreetType.VIA,

  StreetType.LCMT,
  StreetType.ECAM,
  StreetType.LCER,
  StreetType.LENT,
  StreetType.EPSO,
  StreetType.LPLA,
  StreetType.ERCH,
  StreetType.LVER,
]);

export function isStreetPrefix(val: unknown): boolean {
  if (!val) { return false; }
  const type = toStreetType(String(val));
  return type ? StreetPrefixes.has(type) : type;
}

export function isSpanishPrefix(val: unknown): boolean {
  if (!val) { return false; }
  const type = toStreetType(String(val));
  return type ? SpanishPrefixes.has(type) : type;
}

// Don't expand abbreveations that may have multiple ambiguous meanings. Ex: Doctor and Saint.
const DO_NOT_EXPAND: Set<string> = new Set([ StreetType.DR, StreetType.ST ]);
export function streetTypeString(type: StreetType | null, force = false): string | null {
  if (type === null) {
    return null;
  }
  if (!force && DO_NOT_EXPAND.has(normalize(type))) { return type; }
  type = toStreetType(type);
  return titleCase(aliases.StreetType[normalize(type) as StreetType]?.[0] || '');
}

export function isStreetType(val?: string | null): val is StreetType {
  if (!val) { return false; }
  return !!StreetTypeMapping[normalize(val)];
}
