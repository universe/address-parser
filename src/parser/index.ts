import { Country, FacilityType, getCountryDesc, ISitus, isPersonalIdentifier, PersonalIdentifier, toCountry, UnitAbbr } from '@universe/models';

import { directionalString, isDirectional, toDirectional } from '../data/Directional.js';
import { isFacilityType, isUrbanization,toFacilityType } from '../data/FacilityType.js';
import { isState,toState } from '../data/State.js';
import { isStreetPrefix,isStreetType, streetTypeString, toStreetType } from '../data/StreetType.js';
import { isUnitAbbr,toUnitAbbr, unitAbbrString } from '../data/UnitAbbr.js';
import {
  findNextNewLine,
  hasLaterStreetType,
  hasStateUnit,
  Head,
  isHead,
  isHyphenatedCode,
  isNewlineSep,
  isNumberOrCode,
  newlineCount,
  Token,
  tokenize,
} from './tokenizer.js';
import { isNumerical, isOrdinal, normalizeHouseNum, normalizeUnitNum, orderToOrdinal,ordinalToOrder } from './utils.js';

function stripLeadingZeros(str: string) {
  return str.replace(/^0+/, '');
}

interface WorkingSitus {
  care: Token[];
  facility: Token[];
  facilityType: Token | null;
  number: Token[];

  streetPreDir: Token | null;
  streetName: Token[];
  streetType: Token | null;
  streetPostDir: Token | null;

  pinType: Token | null;
  pinNum: Token[];
  unitAbbr: Token | null;
  unitNum: Token[];

  city: Token[];
  state: Token | null;
  zip: Token | null;
  zip4: Token | null;
  country: Country;
}

function expandAbbr(token: Token, directional = false, unit = false, street = false, ordinals = false): void {
  let value = token.value;
  if (token.prev?.separator) { return; }
  if (isDirectional(value)) { value = (directional ? directionalString(value) : toDirectional(value)) || value; }
  if (unit && isUnitAbbr(value)) { value = unitAbbrString(value) || value; }
  if (street && isStreetType(value)) { value = streetTypeString(value) || value; }
  value = ordinals ? orderToOrdinal(value) : ordinalToOrder(value);
  token.value = value;
}

function flatten(token: Token | null): Token[] {
  const tokens: Token[] = [];
  while (token) {
    tokens.push(token);
    token = token.next;
  }
  return tokens;
}

const concat = (input: Token[] | Token, ...flags: boolean[]) => {
  const out = [];
  const tokens: Token[] = !Array.isArray(input) ? flatten(input) : input;

  for (const token of tokens) {
    expandAbbr(token, ...flags);
    if (!isStreetType(token.value) && isFacilityType(token.value)) {
      token.value = toFacilityType(token.value) || token.value;
    }
    out.push(token.value);
    if ((token !== tokens[tokens.length - 1] || token.separator === '.')) {
      if (token.isEOL && !token.separator) {
        out.push('\n');
        continue;
      }
      switch (token.separator) {
        case '#': out.push(' # '); break;
        case '.': out.push('.'); break;
        case '&': out.push(' & '); break;
        case ',': out.push(', '); break;
        case '-': out.push('-'); break;
        case '/': out.push('/'); break;
        default: out.push(' ');
      }
    }
  }
  return out.join('').trim();
};

function toForeignSitus(working: WorkingSitus): ISitus {
  return {
    care: concat(working.care) || null,
    facility: null,
    facilityType: null,
    pinType: null,
    pinNum: null,

    number: null,

    streetPreDir: null,
    streetName: null,
    streetType: null,
    streetPostDir: null,

    unitAbbr: null,
    unitNum: null,

    city: null,
    state: null,
    zip: null,
    zip4: null,
    country: working.country,
  };
}

function toSitus(working: WorkingSitus): ISitus {
  const OUT: ISitus = {
    care: null,
    facility: null,
    facilityType: null,
    pinType: null,
    pinNum: null,

    number: null,

    streetPreDir: null,
    streetName: null,
    streetType: null,
    streetPostDir: null,

    unitAbbr: null,
    unitNum: null,

    city: null,
    state: null,
    zip: null,
    zip4: null,
    country: null,
  };

  OUT.care = concat(working.care, true, true, true, false) || null;
  OUT.facility = concat(working.facility, true, true, false, true) || null;
  OUT.facilityType = working.facilityType ? toFacilityType(working.facilityType.value) : null;
  OUT.pinType = working.pinType ? working.pinType.value.toUpperCase() as PersonalIdentifier : null;
  OUT.pinNum = concat(working.pinNum) ? concat(working.pinNum, false, false, false, true).toUpperCase() : null;

  OUT.number = normalizeHouseNum(stripLeadingZeros(concat(working.number, true, true, true, true))) || null;

  OUT.streetPreDir = working.streetPreDir ? toDirectional(working.streetPreDir.value) : null;
  OUT.streetName = stripLeadingZeros(concat(working.streetName, false, true, true, true)) || null;
  OUT.streetType = working.streetType ? toStreetType(working.streetType.value) : null;
  OUT.streetPostDir = working.streetPostDir ? toDirectional(working.streetPostDir.value) : null;

  OUT.unitAbbr = working.unitAbbr ? toUnitAbbr(working.unitAbbr.value) : null;
  OUT.unitNum = normalizeUnitNum(working.unitNum) || null;

  OUT.city = concat(working.city, true, false, false, false) || null;
  OUT.state = working.state ? toState(working.state.value) : null;
  OUT.zip = working.zip?.value || null;
  OUT.zip4 = working.zip4?.value || null;

  OUT.country = working.country; // We catch foreign addresses early. Everything that makes it this far will be USA.

  if (OUT.facilityType === FacilityType.PO && OUT.unitAbbr === UnitAbbr.BOX) {
    OUT.unitNum = OUT.unitNum ? OUT.unitNum.replace(/ /g, '').toUpperCase() : null;
  }

  return OUT;
}

function consumeIds(pointer: Token | null, hyphensOnly = false): [Token[], Token | null] {
  const ids = [];
  while (pointer && isNumberOrCode(pointer)) {
    ids.push(pointer);
    pointer = pointer.next;
    if (hyphensOnly && pointer?.prev && !isHyphenatedCode(pointer.prev)) { break; }
    if (pointer?.prev && isNewlineSep(pointer.prev)) { break; }
  }
  return [ ids, pointer ];
}

function consumeLine(pointer: Token | null): [Token[], Token | null] {
  const ids = [];
  while (pointer) {
    ids.push(pointer);
    pointer = pointer.next;
    if (pointer?.prev && isNewlineSep(pointer.prev)) { break; }
  }
  return [ ids, pointer ];
}

function isLikelyFinalLine(pointer: Token | null): boolean {
  let foundToken = false;
  let foundCode = false;
  while (pointer) {
    if (isStreetType(pointer.value) || isUnitAbbr(pointer.value)) { foundToken = true; }
    if (isNumberOrCode(pointer.value)) { foundCode = true; }
    if (foundToken && foundCode) { return false; }

    if (isState(pointer.value) && pointer.next && pointer.next.alphas === 0 && pointer.next.decimals === 5) {
      return true;
    }

    if (isNewlineSep(pointer)) { return false; }
    pointer = pointer.next;
  }
  return true;
}

function isLastState(pointer: Token | null): boolean {
  if (!pointer) { return false; }
  if (!isState(pointer.value)) { return false; }
  pointer = pointer.next;
  while (pointer) {
    if (isState(pointer.value)) { return false; }
    pointer = pointer.next;
  }
  return true;
}

function isOnlyIds(pointer: Token | null): boolean {
  while (pointer) {
    if (!isNumberOrCode(pointer) || isOrdinal(pointer.value) || isDirectional(pointer.value) || isStreetType(pointer.value) || isUnitAbbr(pointer.value)) { return false; }
    if (isNewlineSep(pointer)) { break; }
    pointer = pointer.next;
  }
  return true;
}

function isForeignAddress(head: Head, out: WorkingSitus): boolean {
  if (!head.next) { return false; }
  let pointer: Token | Head = head.next;
  while (pointer.next) {
    pointer = pointer.next;
  }

  let countryTest = '';
  while (pointer !== head) {
    if (isHead(pointer)) { break; } // Mostly for Typescript
    if (isNewlineSep(pointer)) { break; }
    countryTest = [ pointer.value, countryTest ].filter(Boolean).join(' ');

    // Don't interpret partial addresses ending in a standard data abbreviation value as foreign.
    if (toState(countryTest) || toStreetType(countryTest) || toUnitAbbr(countryTest)) { continue; }

    const country = toCountry(countryTest);
    if (!country) { pointer = pointer.prev; continue; }

    const desc = getCountryDesc(country);
    if (!desc) { pointer = pointer.prev; continue; }

    if (country === Country.USA || desc.sovereignty === Country.USA) {
      out.country = Country.USA;
      pointer.prev.next = null;
      return false;
    }

    // Handle corner case with addresses that end with "Del Mar".
    if (country === Country.MAR && !pointer.prev.isEOL && (pointer.prev as Token)?.value?.toLowerCase() === 'del') {
      return false;
    }

    pointer.prev.next = null;
    out.care = flatten(head.next);
    out.country = country;
    return true;
  }

  return false;
}

// Extract care-of lines where we have a definite match.
// TODO: Add more definitive company types here...
const CompanyTypes = new Set([ 'UNIVERSITY', 'COLLEGE', 'SERVICES', 'TAW' ]);
const WellKnownCare = new Set(['GENERAL DELIVERY']); // Special Post Office Term
function extractCareOf(head: Head, out: WorkingSitus): void {
  let lineStart: Token | null = head.next;
  let pointer: Token | null = head.next;
  let OUT: Token[] = [];
  let foundStart = false;
  let foundStreetType = false;
  let foundFacilityType = false;
  let foundDefiniteMatch = false;
  let hasCodeTokens = false;

  while (pointer) {
    // If the first value is a straight number, this is likely not a care of line, its a street! Skip.
    if (!foundStart && !pointer.alphas && pointer.decimals) {
      return;
    }

    // If this is a PIN Type, collect accordingly. Ignore pins separated by '&' (ex: A & M Liquors)
    else if (pointer.separator === '&' || pointer.prev.separator === '&') { 1; }
    else if (isNumberOrCode(pointer)) {
      hasCodeTokens = true;
    }
    else if (isStreetType(pointer.value) && !pointer.prev.separator) {
      foundStreetType = true;
    }
    else if (isFacilityType(pointer.value) && !pointer.prev.separator) {
      foundFacilityType = true;
    }
    else if (CompanyTypes.has(pointer.value.toUpperCase())) {
      foundDefiniteMatch = true;
    }

    foundStart = true;
    OUT.push(pointer);

    if (WellKnownCare.has(OUT.map(p => p.value).join(' ').toUpperCase())) {
      foundDefiniteMatch = true;
      pointer.isEOL = true;
    }

    // If we just finished a line, check if is valid.
    if (isNewlineSep(pointer)) {
      // If this line is a definite care-of match, break!
      if (((!foundStreetType && !hasCodeTokens) || (foundStreetType && !hasCodeTokens) || (foundDefiniteMatch && !foundStreetType)) && !foundFacilityType) { break; }
      lineStart = pointer.next;
      foundFacilityType = false;
      foundStreetType = false;
      foundDefiniteMatch = false;
      OUT = [];
    }

    pointer = pointer.next;
  }

  // If this line is a definite care-of match, splice it out of the linked list and return the tokens!
  if (lineStart && ((!foundStreetType && !hasCodeTokens) || (foundStreetType && !hasCodeTokens) || (foundDefiniteMatch && !foundStreetType)) && !foundFacilityType) {
    lineStart.prev.next = pointer?.next || null;
    lineStart.prev.isEOL = pointer?.isEOL || false;
    pointer?.next && (pointer.next.prev = lineStart.prev);
    out.care = OUT;
  }
}

function extractPID(head: Head, out: WorkingSitus) {
  // Extract well know PID types if we can find a definite match.
  let pointer: Token | null = head.next;
  while (pointer) {
    // If this is a PIN Type, collect accordingly.
    if (pointer && isPersonalIdentifier(pointer.value.toUpperCase())) {
      const pid = pointer;
      pointer = pointer.next;
      const [ ids, next ] = consumeLine(pointer);
      if (ids.length === 0) { continue; }

      // There is ambiguity between the "MS" abbreviation for "Mail Stop" and "Mississippi".
      // Ensure we're not accidentally scooping up the state and zip here.
      if (pid.value.toUpperCase() === 'MS' && isLikelyFinalLine(pid)) {
        continue;
      }

      out.pinType = pid;
      out.pinNum = ids;
      pointer = next;

      // Splice the entire PIN statement out of the linked list.
      pid.prev.next = next;
      if (!isHead(pid.prev) && !isHead(next?.prev)) {
        pid.prev.separator = next?.prev?.separator || null;
        pid.prev.isEOL = next?.prev?.isEOL || false;
      }

      next && (next.prev = pid.prev);
      continue;
    }
    pointer = pointer.next;
  }
}

function extractFacility(pointer: Token | null, out: WorkingSitus) {
  let facility: Token[] = [];
  let facilityType: Token | null = null;
  let number: Token[] = [];
  let pinNum: Token[] = [];
  let unitAbbr: Token | null = null;
  let unitNum: Token[] = [];
  facilityLine: while (pointer) {
    // If is a known facility type, save this as a standard value.
    if (!facilityType && toFacilityType(pointer.value)) {
      facilityType = pointer;
      pointer = pointer.next;
    }

    // If is a unit abbreviation then someone put the unit on the facility line! Accommodate.
    else if (toUnitAbbr(pointer.value)) {
      const prevUnitAbbr: Token | null = unitAbbr;
      unitAbbr = pointer;
      pointer = pointer.next;

      // Consume identifiers until there are no more unit ids.
      const [ ids, next ] = consumeIds(pointer);

      // If there is no valid unitNum, then this unit abbr must be part of the facility name.
      if (!ids.length) {
        facility.push(unitAbbr);
        unitAbbr = prevUnitAbbr;
      }
      else {
        unitNum = ids;
        pointer = next;
      }
    }

    // If we've found a number or code, preserve it. This will never run first.
    else if (isNumberOrCode(pointer)) {
      // We only get one (non-hyphenated) number identifier for enumerated facilities. Everything following must be a unit or PIN.
      const isFindNumber = !!(facilityType && !number.length);

      // Fetch all our id tokens.
      const [ ids, next ] = consumeIds(pointer, isFindNumber);

      // To store as a number or pin, it must actually contain a number!
      let hasNum = false;
      for (const id of ids) {
        if (id.value.match(/\d/)) {
          hasNum = true;
          break;
        }
      }

      if (!hasNum) {
        facility = [ ...facility, ...ids ];
      }
      else if (isFindNumber) {
        number = ids;
      }
      else {
        pinNum = ids;
      }
      pointer = next;
    }

    // Otherwise, this is part of the facility name. Save and continue on.
    // If we already have a number going, it was actually party of the facility name.
    // Don't overwrite explicitly named PINs discovered earlier.
    else {
      facility = [ ...facility, ...number, ...pinNum, pointer ];
      number = [];
      pinNum = [];
      pointer = pointer.next;
    }

    // If this is the first token on a new line, break. Facility strings must always be on the first line.
    if (pointer && isNewlineSep(pointer.prev)) { break facilityLine; }
  }

  if (out.pinNum.length && pinNum.length && !out.pinType) {
    out.facility.push(...out.pinNum);
  }
  if (out.facilityType && facilityType) {
    out.facility.push(out.facilityType);
  }

  if (out.number.length && number.length && !out.pinType) {
    out.pinNum = out.number;
  }

  // Promote the previous facility name to the care line if it isn't already specified.
  if (!out.care.length && !out.facilityType && facility.length) {
    out.care = [ ...out.facility, ...(!out.pinType ? out.pinNum : []) ].filter(Boolean) as Token[];
    out.facility = [];
    out.pinNum = out.pinType ? out.pinNum : [];
  }

  // If we've added new facility strings (we may find multiple...) add a comma to delineate.
  if (facility.length) {
    const last = out.facility[out.facility.length - 1];
    last && (last.separator = ',');
  }

  out.facility = [ ...out.facility, ...facility ];
  out.facilityType = facilityType || out.facilityType;
  out.number = number.length ? number : out.number;
  out.pinNum = pinNum.length ? pinNum : out.pinNum;

  out.unitAbbr = unitAbbr || out.unitAbbr;
  out.unitNum = unitNum.length ? unitNum : out.unitNum;

  // If we have a facility type and number, but no facility name, use the number as the facility name – its more accurate.
  if (!out.care.length && out.facilityType && out.number.length && !out.facility.length) {
    out.facility = out.number;
    out.number = [];
  }

  return pointer;
}

export function parse(...lines: string[]): ISitus {
  const address = lines.filter(Boolean).join('\n');
  const head = tokenize(address);

  const OUT: WorkingSitus = {
    care: [],
    facility: [],
    facilityType: null,
    number: [],

    streetPreDir: null,
    streetName: [],
    streetType: null,
    streetPostDir: null,

    pinType: null,
    pinNum: [],
    unitAbbr: null,
    unitNum: [],

    city: [],
    state: null,
    zip: null,
    zip4: null,
    country: Country.USA,
  };

  // Test if this is a foreign address. If yes, we short circuit quickly.
  if (isForeignAddress(head, OUT)) {
    return toForeignSitus(OUT);
  }

  // Extract PIDs where we can find a definite match.
  // Do this before extracting obvious Care-Of lines.
  extractPID(head, OUT);

  // Extract Care Of lines where we can find a definite match.
  extractCareOf(head, OUT);

  let pointer: Token | null = head.next;

  // If a the user puts the unit type and number first, excluding ones that can also be
  // interpreted as facility types, on the first line, make sure we pick it up.
  if (pointer && isUnitAbbr(pointer.value) && !isFacilityType(pointer.value)) {
    OUT.unitAbbr = pointer;
    pointer = pointer.next;
    const [ ids, next ] = consumeIds(pointer, true);
    OUT.unitNum = ids;
    pointer = next;
  }

  // If the very first token is not a number or code, then the first line of our address must be
  // the facility type, facility name, or an accidental leading unit number. Repeat ad-nauseam.
  if (
    pointer &&
    (!isLikelyFinalLine(pointer) || (!newlineCount(head) && !OUT.care.length)) &&
    !isStreetPrefix(pointer?.value) &&
    (isOnlyIds(pointer) || !isNumberOrCode(pointer) || (pointer && (isOrdinal(pointer.value))))
  ) {
    pointer = extractFacility(pointer, OUT);
  }

  while (
    !isLikelyFinalLine(pointer) &&
    findNextNewLine(pointer) &&
    !isStreetPrefix(pointer?.value) &&
    (isOnlyIds(pointer) || !isNumberOrCode(pointer) || (pointer && (isOrdinal(pointer.value))))
  ) {
    pointer = extractFacility(pointer, OUT);
  }

  // If a facility list leads, and the user puts the unit number first on a second line, make sure we pick it up.
  if (pointer && isUnitAbbr(pointer.value)) {
    OUT.unitAbbr = pointer;
    pointer = pointer.next;
    const [ ids, next ] = consumeIds(pointer, true);
    OUT.unitNum = ids;
    pointer = next;
  }
  let isFinalLine = isLikelyFinalLine(pointer);

  // If we have a single letter street name and no street suffix (ugh) ex: 300 H, BENICIA, CA 94510
  if (isFinalLine && OUT.pinNum.length > 1 && OUT.pinNum[OUT.pinNum.length - 1].value.length === 1 && OUT.pinNum[OUT.pinNum.length - 1].alphas === 1) {
    const token = OUT.pinNum.pop();
    token && OUT.streetName.push(token);
    OUT.number = OUT.pinNum;
    OUT.pinNum = [];
  }

  // Consume house number
  while (pointer && !isFinalLine) {
    // If we're on the second line, move on!
    if (OUT.number.length && pointer.prev && isNewlineSep(pointer.prev)) { isFinalLine = true; break; }

    // Stop consuming house number values when a directional or street name is encountered.
    const val = pointer.value;
    if (pointer.alphas > 2 || (pointer.alphas >= 2 && !pointer.decimals) || isOrdinal(val) || isDirectional(val) || isUnitAbbr(val) || isStreetType(val)) {
      break;
    }

    // Save this token as part of the house number.
    // Alphas are always upper case for house numbers.
    OUT.number.push(pointer);

    pointer = pointer.next;
  }

  // Consume directional if available
  if (pointer && !isFinalLine && isDirectional(pointer.value)) {
    OUT.streetPreDir = pointer;
    pointer = pointer.next;
  }

  // Consume street prefix if available
  if (pointer && !isFinalLine && isStreetPrefix(pointer.value)) {
    OUT.streetType = pointer;
    pointer = pointer.next;
  }

  // // Sometimes street prefixes use two tokens.
  // if (pointer && !isFinalLine && isStreetPrefix(pointer.value + ' ' + pointer.next?.value)) {
  //   OUT.streetType = pointer;
  //   pointer = pointer.next?.next || null;
  // }

  // Consume street name until encounter street type, unit abbreviation, or another directional.
  while (pointer && !isFinalLine) {
    // If we're on the second line, move on!
    if (OUT.streetName.length && pointer.prev && isNewlineSep(pointer.prev)) { isFinalLine = true; break; }

    // Addresses with a specified facility type, that is not an urbanization, should never nave street names.
    if (OUT.facilityType && !isUrbanization(OUT.facilityType.value)) { break; }

    // A pound sign separator in the street name means we've moved on to a new segment.
    if (pointer.prev && pointer.prev.separator === '#') { break; }

    // If we're not told where the "city state zip" line starts, we need to make a choice when to stop and start consuming city names.
    // If this is the case, and we encounter something that looks like a unit number, move on to the next step.
    if (OUT.streetName.length && !findNextNewLine(pointer) && hasStateUnit(pointer) && (isNumberOrCode(pointer) || isStreetType(pointer.value))) {
      break;
    }

    // Account for "Directional" Streets (ex: South St.)
    if (OUT.streetPreDir && !OUT.streetName.length && isStreetType(pointer.value) && !isStreetPrefix(pointer.value) && !hasLaterStreetType(pointer, true)) {
      OUT.streetName = [OUT.streetPreDir];
      OUT.streetPreDir = null;
      break;
    }

    // If we have a single letter street name and no street suffix (ugh) ex: 300 H Apt: 111, BENICIA, CA 94510
    if (
      OUT.number.length > 1 &&
      OUT.number[OUT.number.length - 1].value.length === 1 &&
      OUT.number[OUT.number.length - 1].alphas === 1 &&
      (isUnitAbbr(pointer.value) || isStreetType(pointer.value))
    ) {
      const token = OUT.number.pop();
      token && OUT.streetName.push(token);
      break;
    }

    // If we have a street name, and we're at an enumerable entry, move on.
    if (OUT.streetName.length && ((isStreetType(pointer.value) && !hasLaterStreetType(pointer, true)) || isUnitAbbr(pointer.value) || isDirectional(pointer.value))) {
      break;
    }

    OUT.streetName.push(pointer);
    pointer = pointer.next;
  }

  // Consume street type, unit abbr, and directional in that order until no longer available.
  // If duplicate unit abbreviation or directional tokens appear before a street type, add to
  // the street name instead of overwriting the value.
  interface IWorkingTokens {
    streetType: Token | null;
    unitAbbr: Token | null;
    streetPostDir: Token | null;
  }

  const working: IWorkingTokens = {
    streetType: null,
    unitAbbr: null,
    streetPostDir: null,
  };

  while (pointer && !isFinalLine) {
    // If we're on the second line, move on to the city parser!
    if (pointer.prev && isNewlineSep(pointer.prev)) { isFinalLine = isLikelyFinalLine(pointer); break; }

    // If is a street type, save it and move on.
    if (isStreetType(pointer.value)) {
      if (working.streetType) {
        OUT.streetName.push(working.streetType);
      }
      working.streetType = pointer;
    }

    // If is a unit abbreviation, deal with duplicates if street isn't done and save.
    else if (isUnitAbbr(pointer.value)) {
      if ((OUT.unitAbbr || hasLaterStreetType(pointer)) && working.unitAbbr) {
        OUT.streetName.push(working.unitAbbr);
      }
      working.unitAbbr = pointer;
    }

    // If is a post directional, deal with duplicates if street isn't done and save.
    else if (isDirectional(pointer.value) && !working.unitAbbr) {
      if (working.streetPostDir && working.streetType === null) {
        OUT.streetName.push(working.streetPostDir);
      }
      working.streetPostDir = pointer;
    }

    // If we didn't find any of these things, we must be moving on to the unit number!
    else {
      break;
    }

    // If we found one of these tokens, move on to the next one to check.
    pointer = pointer.next;
  }
  // Save what we've found to the OUT. Don't overwrite the unitAbbr if we already have one from a previous line.
  OUT.streetType = working.streetType || OUT.streetType;
  OUT.streetPostDir = working.streetPostDir || OUT.streetPostDir;
  OUT.unitAbbr = OUT.unitAbbr || working.unitAbbr;
  working.streetPostDir = null;
  working.unitAbbr = null;
  working.streetType = null;

  // If we have a no street information, already have unit info, and have tokens left in this line
  // then we're looking at the second line of a facility style address. Store the rest of this in
  // the street name (typically a department, university name, etc) and move on.
  if (OUT.unitAbbr && !OUT.streetName.length && findNextNewLine(pointer)) {
    while (pointer && !isFinalLine) {
      if (pointer.prev && isNewlineSep(pointer.prev)) { isFinalLine = isLikelyFinalLine(pointer); break; }
      OUT.streetName.push(pointer);
      pointer = pointer?.next;
    }
  }

  else {
    // Consume unit num until encounter street type, unit abbreviation, or another directional.
    // Unit numbers can be single letters "S", numbers "123", numerical "13th", etc.
    let tossOnNextUnitNum = false;
    const hasFutureNewline = !!findNextNewLine(pointer);
    const init = pointer?.prev;
    while (pointer && !isFinalLine) {
      // If we're on the second line, move on to the city parser!
      if (pointer.prev && pointer.prev !== init && isNewlineSep(pointer.prev)) { isFinalLine = isLikelyFinalLine(pointer); break; }

      if (isFacilityType(pointer.value) && !isUnitAbbr(pointer.value)) {
        OUT.facilityType = pointer;
        pointer = pointer.next;
        continue;
      }

      // If this is a unit abbr as a type (ex: "Floor", "Penthouse"), save it and move on.
      if (isUnitAbbr(pointer.value)) {
        const oldUnitAbbr: Token | null = OUT.unitAbbr;
        OUT.unitAbbr = pointer;
        pointer = pointer.next;
        // If is a unit abbr, and we've already found a unit abbreviation, be prepared to toss our old unit num.
        if (oldUnitAbbr !== OUT.unitAbbr) {
          // break;
          tossOnNextUnitNum = true;
          continue;
        }

        OUT.unitNum = [];
        continue;
      }

      // If this is a directional, push the abbreviation to the unit number path.
      // Ex: East and West buildings on a campus "25 Sierra St Apt #123 East"
      if (isDirectional(pointer.value) && (!hasFutureNewline || isNewlineSep(pointer))) {
        pointer.value = toDirectional(pointer.value);
        pointer.alphas = pointer.value.length;
        OUT.unitNum.push(pointer);
        pointer = pointer.next;
        continue;
      }

      // If we're not told where the "city state zip" line starts, we need to make a choice when to stop and start consuming city names.
      // Most of the time, we'll just be left with unit numbers at this point
      if (!hasFutureNewline && !isNumberOrCode(pointer)) {
        break;
      }

      if (tossOnNextUnitNum) {
        OUT.unitNum = [];
        tossOnNextUnitNum = false;
      }

      OUT.unitNum.push(pointer);

      pointer = pointer.next;
    }
  }

  // Consume city name until encounter a state abbreviation or a number (presumably a zip code).
  while (pointer) {
    if (!pointer.separator && (isNumberOrCode(pointer) || isLastState(pointer))) {
      break;
    }
    OUT.city.push(pointer);
    pointer = pointer.next;
  }

  // Consume State if available
  if (pointer && isState(pointer.value)) {
    OUT.state = pointer;
    pointer = pointer.next;
  }

  // If we're at the end and we have a string with no alphas, its a zip code.
  if (pointer && pointer.alphas === 0) {
    OUT.zip = pointer;
    pointer = pointer.next;
  }

  // If we're at the end and we have a string with no alphas...again, then its a zip+4 code.
  if (pointer && pointer.alphas === 0) {
    OUT.zip4 = pointer;
    pointer = pointer.next;
  }

  // Common Error Corrections! Order is important here.

  // Some streets have the street type as a *prefix* not a *type*. Catch these. Ignore for "directional" streets (ex: South St.)
  if (!OUT.streetType && isStreetType(OUT.streetName[0]?.value) && (isNumberOrCode(OUT.streetName[1]) || (OUT.streetName[1]?.value || '').toLowerCase() === 'of')) {
    OUT.streetType = OUT.streetName.shift() as Token;
  }

  // Another error case. If we don't have a street type, and the street name *is* a type,
  // save it as the type value. Ex: 100 Lake APT 200
  if (!OUT.streetType && OUT.streetName.length === 1 && isStreetType(OUT.streetName[0].value)) {
    OUT.streetType = OUT.streetName[0];
    OUT.streetName = [];
  }

  // If we don't have a street type or unit abbreviation, check to make sure
  // the unit number didn't accidentally get appended to the street name.
  // This is an error case where we try to do the less likely bad thing.
  if (OUT.streetName.length && !OUT.streetType && !OUT.streetPostDir && !OUT.unitAbbr) {
    if (isNumerical(OUT.streetName[OUT.streetName.length - 1].value)) {
      OUT.unitNum.push(OUT.streetName.pop() as Token);
    }
  }

  // When we have a city name that contains a street type (ex '211 OLIVER ST BUENA VISTA 31803'), don't
  // pull the city name into the street name by accident.
  if (OUT.streetType && OUT.streetName.length && !OUT.city.length && OUT.unitNum.length === 1 && OUT.unitNum[0].value.length === 5 && !OUT.unitNum[0].alphas) {
    let streetType: Token | null = null;
    const streetName: Token[] = [];
    const city: Token[] = [];
    for (const token of OUT.streetName) {
      if (isStreetType(token.value) && !streetType) {
        streetType = token;
      }
      else {
        streetType ? city.push(token) : streetName.push(token);
      }
    }
    if (streetType) {
      city.push(OUT.streetType);
      OUT.streetType = streetType;
      OUT.streetName = streetName;
      OUT.city = city;
      OUT.zip = OUT.unitNum[0];
      OUT.unitNum = [];
    }
  }

  // If we have no street name, and the last character of the houseNum is a single character,
  // This must be a single letter street name! Ex: 123 H St.
  if (!OUT.streetName.length && OUT.number.length > 1) {
    const working: Token[] = [];
    do {
      const token = OUT.number.pop() as Token;
      if (working.length && !token.separator) {
        OUT.number.push(token);
        break;
      }
      working.unshift(token);
    } while (OUT.number.length);
    OUT.streetName = working;
  }

  // AAAAAaaaaand another. If no street number, but we have a unit number, and the street type
  // is not one of our special standalone street designators (just 'PO' right now for PO Boxes),
  // then the input must have listed the street number after the street name.
  // Ex: S St 305, Sacramento CA, but not PO Box 1337
  if (!OUT.number.length && ((OUT.unitNum.length === 1 && !OUT.unitAbbr) || (OUT.unitNum.length > 1 && !OUT.facilityType))) {
    OUT.number.push(OUT.unitNum.pop() as Token);
  }

  // If we don't have an explicit unit abbr, and the unit number is not a... number,
  // then it must be a mis-ordered company name field.
  if (!OUT.unitAbbr && !OUT.care.length && OUT.unitNum.length) {
    let hasCode = false;
    for (const token of OUT.unitNum) {
      let isCode = false;
      if (isOrdinal(token.value)) { isCode = false; }
      else { isCode = isNumberOrCode(token); }
      hasCode = hasCode || isCode;
    }
    if (!hasCode) {
      OUT.care = OUT.unitNum;
      OUT.unitNum = [];
    }
  }

  // Fix split PO Box numbers. If a PO Box has been provided, we can assume that the more common human
  // error will be to add extra spaces or separators instead of providing un-delineated additional PINs.
  if (toFacilityType(OUT.facilityType?.value || '') === FacilityType.PO && toUnitAbbr(OUT.unitAbbr?.value || '') === UnitAbbr.BOX && OUT.unitNum.length > 1) {
    const first = OUT.unitNum.shift() as Token;
    first.separator = null;
    for (const token of OUT.unitNum) {
      first.value += token.value;
    }
    OUT.unitNum = [first];
  }

  // If we have a non explicitly named facility type, and no care-of field or a pin of an
  // unknown type, promote the arbitrary "facility" name to the care-of line.
  if (!OUT.facilityType && OUT.facility.length && !OUT.care.length) {
    OUT.care = OUT.facility;
    OUT.facility = [];
  }

  if (OUT.care.length) {
    const last = OUT.care[OUT.care.length - 1];
    if (last && (last.value.toUpperCase() === 'LIMITED' || last.value.toUpperCase() === 'LTD')) {
      OUT.care.pop();
    }
  }

  const lastNum = OUT.number[OUT.number.length - 1];
  if (OUT.number.length > 1 && lastNum && (!lastNum.prev.separator || lastNum.decimals === 0)) {
    OUT.unitNum.push(OUT.number.pop() as Token);
  }

  if (OUT.facilityType && toFacilityType(OUT.facilityType?.value) === FacilityType.PO) {
    OUT.unitAbbr = {
      value: UnitAbbr.BOX,
      prev: OUT.facilityType,
      next: OUT.facilityType.next,
      decimals: 0,
      alphas: 3,
      separator: null,
      isEOL: OUT.facilityType.isEOL,
    };
    OUT.facilityType.next = OUT.unitAbbr;
  }

  // CORRECTION! For ordinal unit numbers appearing after street name, like "20th Floor"
  // if (OUT.facility.length === 1 && isUnitAbbr(OUT.facility[0].value) && OUT.pinNum.length && !OUT.unitAbbr && !OUT.unitNum.length) {
  //   OUT.unitAbbr = OUT.care[0];
  //   OUT.unitNum = OUT.pinNum;
  //   OUT.care = [];
  //   OUT.pinNum = [];
  // }

  return toSitus(OUT);
}
