import { Country, FacilityType, getCountryDesc, isCountry,isDirectional, ISitus, State, StreetType } from '@universe/models';

import { toDirectional } from './data/Directional.js';
import { isUrbanization } from './data/FacilityType.js';
import { isStreetPrefix, streetTypeString, toStreetType } from './data/StreetType.js';
import { parse } from './parser/index.js';
import { isNumberOrCode } from './parser/tokenizer.js';
import { isOrdinal } from './parser/utils.js';

export interface USPSLabel {
  care: string | null;
  urbanization: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: State | null;
  zip: string | null;
  zip4: string | null;
  country: string | null;
}

function concat(...values: (string | null)[]): string {
  return values.filter(Boolean).join(' ').toUpperCase().trim();
}

// USPS likes to force some streets to always be expanded...
const forceStreetExpansion = new Set([StreetType.PLZ]);
const singleStreetSuffix = new Set([
  StreetType.BLFS, StreetType.BRKS, StreetType.CIRS, StreetType.CLFS, StreetType.CMNS,
  StreetType.CORS, StreetType.CTS, StreetType.XING, StreetType.XRDS, StreetType.DRS,
  StreetType.ESTS, StreetType.EXTS, StreetType.FLS, StreetType.FLDS, StreetType.FLTS,
  StreetType.FRDS, StreetType.JCTS, StreetType.KYS, StreetType.KNLS, StreetType.MEWS,
  StreetType.MDWS, StreetType.RDGS, StreetType.RIV, StreetType.SHLS, StreetType.SHRS,
  StreetType.SPGS, StreetType.SQS, StreetType.ST, StreetType.STS, StreetType.TER,
  StreetType.VLY, StreetType.VLYS, StreetType.VLG, StreetType.VLGS, StreetType.VIS,
  StreetType.WALK, StreetType.WAY, StreetType.WLS,
]);
function streetName(name: string | null, type: StreetType | null): (string | null)[] {
  if (!type || isStreetPrefix(type)) { return [name]; }

  let streetTypeOut: string = type;
  if (forceStreetExpansion.has(type)) { streetTypeOut = streetTypeString(type) || type; }

  if (!name) { return [streetTypeOut]; }

  if (name.startsWith('of the') || (isNumberOrCode(name) && !isOrdinal(name) && !isDirectional(name) && !singleStreetSuffix.has(type))) {
    return [ streetTypeString(toStreetType(type), true), name ];
  }

  return [ name, streetTypeOut ];
}

export class Address {
  address: ISitus;

  constructor(...lines: string[] | ISitus[]) {
    if (typeof lines[0] === 'string') {
      this.address = parse(lines.join('\n'));
    }
    else {
      this.address = lines[0];
    }
  }

  static label(addr?: ISitus | null): USPSLabel {
    if (!addr) {
      return {
        care: null,
        urbanization: null,
        line1: null,
        line2: null,
        city: null,
        state: null,
        zip: null,
        zip4: null,
        country: null,
      };
    }

    // Simple bug catching.
    if (addr.unitNum === addr.zip) { addr.unitNum = null; }

    // This is how USPS wants UMRs presented.
    if (addr.facilityType === FacilityType.UMR) {
      addr.facilityType = 'UNIT' as FacilityType;
    }

    addr.streetPreDir = addr.streetPreDir ? toDirectional(addr.streetPreDir) : null;
    addr.streetPostDir = addr.streetPostDir ? toDirectional(addr.streetPostDir) : null;

    // Ensure we have clean PO Boxes for USPS.
    if (addr.facilityType === FacilityType.PO) {
      addr.facility = null;
    }

    let streetSegment: string | null = concat(
      addr.facilityType && !isUrbanization(addr.facilityType) ? '' : addr.number,
      isStreetPrefix(addr.streetType) ? streetTypeString(addr.streetType) : '',
      addr.streetPreDir,
      ...streetName(addr.streetName, addr.streetType),
      addr.streetPostDir,
    );
    let facility: string | null = concat(addr.facilityType, addr.facility, addr.facilityType ? addr.number : '');
    const PIN = concat(addr.pinType || (addr.pinNum && '#'), addr.pinNum);
    const unit = concat(addr.unitAbbr || (addr.unitNum && '#'), addr.unitNum);

    let urbanization = null;
    if (isUrbanization(addr.facilityType)) {
      urbanization = concat(addr.facilityType, addr.facility);
      facility = null;
    }

    if (addr.facilityType === FacilityType.PO) {
      streetSegment = null;
    }

    const line2 = null;
    if (unit || PIN) {
      if ((facility && streetSegment) || (addr.facilityType === FacilityType.PO)) {
        facility = concat(facility, unit);
        facility = concat(facility, PIN);
      }

      else if (streetSegment) {
        streetSegment = concat(streetSegment, unit);
        streetSegment = concat(streetSegment, PIN);
      }

      else {
        facility = concat(facility, unit);
        facility = concat(facility, PIN);
      }
    }

    // if (PIN) {
    //   if (!facility && streetSegment && !addr.pinType) {
    //   }
    // }

    return {
      care: addr.care ? addr.care.toUpperCase() : null,
      urbanization,
      line1: facility || streetSegment,
      line2: ((facility && streetSegment) ? streetSegment : line2) || null,
      city: addr.city ? addr.city.toUpperCase() : null,
      state: addr.state ? addr.state : null,
      zip: addr.zip || null,
      zip4: addr.zip4 || null,
      country: addr.country || null,
    };
  }

  static lines(addr?: ISitus | null): [string | null, string | null, string | null, string | null] {
    if (!addr) { return [ null, null, null, null ]; }
    const label = Address.label(addr);
    const out = [
      label.care,
      label.urbanization,
      [ label.line1, label.line2 ].filter(Boolean).join(' ').trim(),
      [ label.city, label.state, label.zip ? ` ${label.zip}` : null ].filter(Boolean).join(' ').trim(),
    ].filter(Boolean);
    if (isCountry(label.country) && label.country !== Country.USA && label.country !== Country.FOREIGN) {
      const name = getCountryDesc(label.country)?.name;
      name && out.push(name.toUpperCase());
    }
    return [
      out[0] || null,
      out[1] || null,
      out[2] || null,
      out[3] || null,
    ];
  }

  static print(addr?: ISitus | null): string {
    if (!addr) { return ''; }
    return Address.lines(addr).filter(Boolean).join('\n');
  }

  public label(): USPSLabel { return Address.label(this.address); }
  public lines(): [string | null, string | null, string | null, string | null] { return Address.lines(this.address); }
  public print(): string { return Address.print(this.address); }
}
