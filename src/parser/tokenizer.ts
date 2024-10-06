import { StreetType,UnitAbbr } from '@universe/models';

import { isState } from '../data/State.js';
import { isStreetType } from '../data/StreetType.js';
import { isNumerical, isOrder,orderToOrdinal, titleCase } from './utils.js';
// import { isFacilityType } from '../FacilityType';
// import { isUnitAbbr } from '../UnitAbbr';

// /* eslint-disable */
// TODO: Spell Check Integration?
// const Typo = require("typo-js");
// const dictionary = new Typo('en_US');
// /* eslint-enable */

const alphas = new Set([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',

  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]);

const decimals = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
]);

// https://pe.usps.com/text/pub28/28c3_019.htm
const legalChars = new Set([ ...alphas, ...decimals ]);

const newlines = new Set([ ',', '\t', '\n' ]);
const dashes = new Set([ '-', '–', '—' ]);
const slashes = new Set([ '\\', '/' ]);

export interface Token {
  /* eslint-disable-next-line no-use-before-define */
  prev: Head | Token;
  next: Token | null;
  value: string;
  separator: '-' | '.' | '#' | '&' | ',' | '/' | null;
  alphas: number;
  decimals: number;
  isEOL: boolean;
}

export interface Head {
  isHead: true;
  next: Token | null;
  separator: '';
  isEOL: false;
}

// Special non-enumerated abbreviations we want to make sure we capitalize
// https://en.wikipedia.org/wiki/Ship_prefix
const capitalize = new Set([ 'AFB', 'APO', 'FPO', 'AECOM', 'HQBN',
  // https://en.wikipedia.org/wiki/List_of_colloquial_names_for_universities_and_colleges_in_the_United_States
  'AFA', 'A&M', 'A&T', 'APSU', 'ALASU', 'ASU', 'AU', 'AUM', 'BC', 'BGSU', 'BHSU', 'BJU', 'BMC', 'BSC', 'BSU', 'BU',
  'BYU', 'CBU', 'CC', 'CCNY', 'CCSU', 'CCU', 'CCV', 'CGU', 'CIA', 'CMC', 'CMU', 'CNU', 'CSB', 'SJU', 'CSE', 'CSI',
  'CSU', 'CSUF', 'CSUEB', 'CSULA', 'CSUS', 'CU', 'CUA', 'CUNY', 'DC', 'DPU', 'DSU', 'DU', 'ECU', 'EIU', 'EMU', 'EMU',
  'ENC', 'ETSU', 'EWU', 'EKU', 'F&M', 'FAMU', 'FAU', 'FC', 'FDU', 'FGCU', 'FIT', 'FIU', 'FPU', 'FSU', 'FU', 'GB', 'GCU',
  'GGC', 'GONZ', 'GSU', 'GT', 'GVSU', 'HIU', 'HMC', 'HU', 'HU', 'HSU', 'IC', 'IIT', 'IPFW', 'ISU', 'IUP', 'IUPUI', 'IWU',
  'IW', 'JHU', 'JMU', 'JWU', 'JSU', 'JU', 'KSU', 'KU', 'KU', 'LC', 'LHU', 'LIU', 'LMU', 'LSU', 'LSSU', 'LTU', 'LU', 'LUC',
  'MCLA', 'MIT', 'MMC', 'MSU', 'MTSU', 'MTU', 'MU', 'MVSU', 'MUW', 'NAU', 'NCCU', 'NCSU', 'ND', 'NDSU', 'NEU', 'NIU', 'NKU',
  'NMSU', 'NMU', 'NSU', 'NU', 'NVU', 'NW', 'NWMSU', 'NYIT', 'NYMC', 'NYU', 'OC', 'OCC', 'OCU', 'ODU', 'OIT', 'ONU', 'ORU',
  'OSU', 'OU', 'PC', 'PCC', 'PLNU', 'POM', 'PSU', 'PTS', 'PVAMU', 'QU', 'RHIT', 'RIC', 'RISD', 'RIT', 'R-MWC', 'RPI', 'RU',
  'RWU', 'RWC', 'SBU', 'SC', 'SCSU', 'SCU', 'SDSM&T', 'SDSU', 'SFSU', 'SHC', 'SIUE', 'SJC', 'SJFC', 'SJSU', 'SJU', 'SLU',
  'SMC', 'SMU', 'SNHU', 'SOSU', 'SPU', 'SRU', 'SSU', 'SU', 'SUI', 'SUU', 'SUNY', 'SWOSU', 'TAMU', 'TAMUCC', 'TCNJ', 'TCU',
  'TSU', 'TTU', 'TU', 'UA', 'UAA', 'UAB', 'UAF', 'UAH', 'UALR', 'UAM', 'UAPB', 'UB', 'UC', 'UCB', 'UCA', 'UCCS', 'UCD', 'UCF',
  'UCI', 'UCLA', 'UCM', 'UCO', 'UCR', 'UCSB', 'UCSC', 'UCSD', 'UCSF', 'UD', 'UDM', 'UDC', 'UF', 'UGA', 'UH', 'UHCL', 'UHD', 'UHS',
  'UHV', 'UIC', 'UIUC', 'UK', 'ULM', 'UL', 'UMB', 'UMBC', 'UMC', 'UMD', 'UMKC', 'UML', 'UMO', 'UMW', 'UNA', 'UNC', 'UNCC',
  'UNCG', 'UNCW', 'UND', 'UNF', 'UNH', 'UNI', 'UNK', 'UNL', 'UNLV', 'UNM', 'UNO', 'UNR', 'UNT', 'UO', 'UOP', 'UP', 'UPIKE',
  'URI', 'USA', 'USAFA', 'USAO', 'USC', 'USCA', 'USD', 'USF', 'USFCA', 'USI', 'USM', 'USU', 'UT', 'UTA', 'UTB/TSC', 'UTC',
  'UTD', 'UTEP', 'UTM', 'UTPB', 'UTRGV', 'UTSA', 'UVA', 'UVM', 'UVU', 'UW', 'UWF', 'UWG', 'UWGB', 'UWM', 'VCU', 'VMI', 'VPI',
  'VSU', 'VTC', 'VU', 'W&J', 'W&L', 'W&M', 'WC', 'WCU', 'WFU', 'WGU', 'WIU', 'WKU', 'WMU', 'WPI', 'WSU', 'WTAMU', 'WVU', 'WVUP',
  'WWU', 'XU', 'XULA', 'YSU', 'YU',
]);

export function isHead(token: unknown): token is Head {
  return !!(token && (token as Head).isHead);
}

export function insertTokenAfter(prev: Token, value: string): Token {
  const token = {
    prev,
    next: prev.next,
    value,
    separator: null,
    alphas: (value.match(/[a-zA-Z]/g) || []).length,
    decimals: (value.match(/\d/g) || []).length,
    isEOL: prev.isEOL,
  };
  token.prev.next = token;
  token.prev.isEOL = false;
  token.next && (token.next.prev = token);
  return token;
}

export function insertTokenBefore(next: Token, value: string): Token {
  const token = {
    prev: next.prev,
    next,
    value,
    separator: null,
    alphas: (value.match(/[a-zA-Z]/g) || []).length,
    decimals: (value.match(/\d/g) || []).length,
    isEOL: false,
  };
  token.prev && (token.prev.next = token);
  token.next && (token.next.prev = token);
  return token;
}

export function isNumberOrCode(pointer: Token | string | null): boolean {
  if (!pointer) { return false; }

  const working = {
    value: typeof pointer === 'string' ? pointer : pointer.value,
    decimals: typeof pointer === 'string' ? pointer.match(/\d/g)?.length || 0 : pointer.decimals,
    alphas: typeof pointer === 'string' ? pointer.toLowerCase().match(/[^\d]/g)?.length || 0 : pointer.alphas,
    prev: null,
    separator: typeof pointer === 'string' ? '' : pointer.separator,
  };

  if (working.separator === '&') { return false; }

  // If string starts with a number, this is a code. Ex: Ordinals (1st, 2nd, etc)
  if (working.value && working.value[0].match(/^\d/)) { return true; }

  // Dashed one, two and three character alpha strings *are* codes!
  if (working.alphas <= 3 && !working.decimals && (dashes.has(working.separator || '') || dashes.has((pointer as Token).prev?.separator || ''))) { return true; }

  // If decimals equal or outnumber alphas, or this is a single character string, is a code.
  return (working.decimals >= working.alphas && working.decimals > 1) || (working.alphas <= 1);
}

export function tokenize(addr: string): Head {
  const head: Head = {
    next: null,
    isHead: true,
    separator: '',
    isEOL: false,
  };

  // Collapse whitespace
  // TODO: This regex is inordinately expensive. Replace.
  addr = addr.replace(/\n+/g, '\n').replace(/ +/g, ' ').replace(/\t+/g, '\t');

  // TODO: All of the below regexps are VERY expensive. Simplify.
  // Remove Care Of Abbr.
  addr = addr.replace(/C[/.]O\.?/gi, '');

  // P.O. Boxes and H.C. Boxes are Special.
  addr = addr
    .replace(/P\.O\./i, 'PO')
    .replace(/P\.O/i, 'PO')
    .replace(/P O /i, 'PO')
    .replace(/P\.O\.B\./i, ' PO BOX ')
    .replace(/P\. O\. B\./i, ' PO BOX ')
    .replace(/ POB[\d ]/i, 'PO BOX')
    .replace(/POX BOX/i, 'PO BOX')
    .replace(/POBOX/i, 'PO BOX')
    .replace(/POBX/i, 'PO BOX');
  addr = addr.replace(/H\.C\./i, 'HC ').replace(/H\.C/, 'HC ').replace(/H C /, 'HC ').replace(/HCBOX/i, 'HC BOX');

  addr = addr.replace(/highway carrier route/i, 'HC');
  addr = addr.replace(/highway contract route/i, 'HC');
  addr = addr.replace(/highway carrier/i, 'HC');
  addr = addr.replace(/highway contract/i, 'HC');
  addr = addr.replace(/star route/i, 'HC');
  addr = addr.replace(/rural route/i, 'RR');

  addr = addr.replace(/rural road/i, 'RR');
  addr = addr.replace(/township road/i, 'TSR');
  addr = addr.replace(/state route/i, 'SR');
  addr = addr.replace(/state road/i, 'SR');
  addr = addr.replace(/county road/i, 'CR');

  addr = addr.replace(/r\.\r\. rd/i, 'RR');
  addr = addr.replace(/s\.\r\. rd/i, 'SR');
  addr = addr.replace(/c\.\r\. rd/i, 'CR');

  addr = addr.replace(/rural rd/i, 'RR');
  addr = addr.replace(/township rd/i, 'TSR');
  addr = addr.replace(/state rd/i, 'SR');
  addr = addr.replace(/county rd/i, 'CR');

  addr = addr.replace(/LA CAMINITO/i, 'LACAMINITO');
  addr = addr.replace(/EL CAMINO/i, 'ELCAMINO');
  addr = addr.replace(/LA CERRADA/i, 'LACERRADA');
  addr = addr.replace(/LA ENTRADA/i, 'LAENTRADA');
  addr = addr.replace(/EL PASEO/i, 'ELPASEO');
  addr = addr.replace(/LA PLACITA/i, 'LAPLACITA');
  addr = addr.replace(/EL RANCHO/i, 'ELRANCHO');
  addr = addr.replace(/LA VEREDA/i, 'LAVEREDA');

  let pointer: Token | null = {
    prev: head,
    next: null,
    value: '',
    separator: null,
    alphas: 0,
    decimals: 0,
    isEOL: false,
  };

  head.next = pointer;

  for (let i = 0; i < addr.length; i++) {
    const char = addr[i];
    const next = addr[i + 1];
    if (!pointer) { break; }
    if (legalChars.has(char)) {
      pointer.value += char;
      if (alphas.has(char)) {
        pointer.alphas++;
      }
      if (decimals.has(char)) {
        pointer.decimals++;
      }
    }
    else {
      if (newlines.has(char)) { pointer.isEOL = true; }
      else if (dashes.has(char)) { pointer.separator = '-'; }
      else if (char === '.') { pointer.separator = '.'; }
      else if (char === '&') { pointer.separator = '&'; }
      else if (char === '#') { pointer.separator = '#'; }
      else if (slashes.has(char)) { pointer.separator = '/'; }
      // if (!isNumberOrCode(pointer) && !isState(pointer.value) && !isStreetType(pointer.value) && !isFacilityType(pointer.value) && !isUnitAbbr(pointer.value)) {
      //   if (!dictionary.check(pointer.value)) {
      //     const suggestions = dictionary.suggest(pointer.value);
      //     pointer.value = suggestions[0] || pointer.value;
      //   }
      // }
      pointer.value = capitalize.has(pointer.value.toUpperCase()) ? pointer.value.toUpperCase() : titleCase(pointer.value);
      if (legalChars.has(next)) {
        pointer = {
          prev: pointer,
          next: null,
          value: '',
          separator: null,
          alphas: 0,
          decimals: 0,
          isEOL: false,
        };
        if (pointer.prev) {
          pointer.prev.next = pointer;
        }
      }
    }
  }

  // No newlines after the last State discovered.
  while (pointer) {
    if (pointer.next && isState(pointer.next.value)) {
      while (pointer) {
        pointer.isEOL = false;
        pointer = pointer.next;
      }
      break;
    }
    if (isHead(pointer.prev)) { break; }
    pointer = pointer.prev;
  }

  // It is common for people to be silly and prefix/suffix some unit numbers with these common abbreviation.
  // Ex: 123 Water St. Apt APT1, 45 Spruce Ave 1PH
  // TODO: We can make this more robust...
  pointer = head.next;
  while (pointer) {
    if (!pointer) { break; }

    if (isOrder(pointer.value)) {
      pointer.value = orderToOrdinal(pointer.value);
    }

    const prefixTest = [ UnitAbbr.APT, UnitAbbr.PH, UnitAbbr.LV, StreetType.RR, 'SUITE', 'UNIT' ];
    const suffixText = [UnitAbbr.PH];

    for (const prefix of prefixTest) {
      if (pointer.value.toLowerCase().startsWith(prefix.toLowerCase()) && pointer.value.length > prefix.length) {
        // Special Case for plurals
        if (pointer.value.toUpperCase() === `${prefix.toUpperCase()  }S`) { continue; }

        const oldValue = pointer.value;
        pointer.value = pointer.value.slice(prefix.length);
        pointer.alphas -= prefix.length;
        if (!isNumberOrCode(pointer)) {
          pointer.alphas += prefix.length;
          pointer.value = oldValue;
        }
        else {
          insertTokenBefore(pointer, prefix);
        }
      }
    }

    for (const suffix of suffixText) {
      if (pointer && pointer.value.toLowerCase().endsWith(suffix.toLowerCase()) && pointer.value.length > suffix.length) {
        const oldValue = pointer.value;
        pointer.value = pointer.value.slice(0, suffix.length * -1);
        pointer.alphas -= suffix.length;
        if (!isNumberOrCode(pointer)) {
          pointer.alphas += suffix.length;
          pointer.value = oldValue;
        }
        else {
          const newToken = insertTokenAfter(pointer, suffix);
          pointer = newToken;
        }
      }
    }
    pointer = pointer.next;
  }

  // Some mis-formatted facility addresses will prepend a '0' to make them appear like street addresses.
  if (head.next && head.next.value === '0' && head.next.next) {
    head.next = head.next.next;
  }

  return head;
}

// TODO: Use USPS hyphenation standards.
export function isHyphenatedCode(pointer: Token | Head): boolean {
  if (isHead(pointer)) { return false; }
  if (!pointer.next || !dashes.has(pointer.separator || '')) { return false; }
  return !!(isNumerical(pointer.value) && isNumerical((pointer.next as Token).value));
}

export function isNewlineSep(pointer: Token | Head | null): boolean {
  if (!pointer || isHead(pointer)) { return false; }
  return pointer?.isEOL;
}

export function newlineCount(pointer: Token | Head | null): number {
  let current: Token | Head | null = pointer;
  let i = 0;
  while (current) {
    if (isNewlineSep(current)) { i++; }
    current = current.next;
  }
  return i;
}

export function findNextNewLine(pointer: Token | null): Token | null {
  let current: Token | null = pointer;
  while (current) {
    if (isNewlineSep(current)) { return current.next; }
    current = current.next;
  }
  return null;
}

export function hasLaterStreetType(pointer: Token | null, lineOnly = false): boolean {
  if (!pointer) { return false; }
  if (isNewlineSep(pointer)) { return false; }
  let current: Token | null = pointer.next;
  while (current) {
    if (isStreetType(current.value)) { return true; }
    if (lineOnly && current.separator) { break; }
    current = current.next;
  }
  return false;
}

export function hasStateUnit(pointer: Token | null, lineOnly = false): boolean {
  let current: Token | null = pointer;
  while (current) {
    if (isState(current.value)) { return true; }
    if (lineOnly && current.separator) { break; }
    current = current.next;
  }
  return false;
}

export function newLineCount(pointer: Token | null): number {
  let current: Token | null = pointer;
  let count = 0;
  while (current) {
    if (isNewlineSep(current)) { count++; }
    current = current.next;
  }
  return count;
}

export function streetTypeCount(pointer: Token | null): number {
  let current: Token | null = pointer;
  let count = 0;
  while (current) {
    if (isStreetType(current.value)) { count++; }
    current = current.next;
  }
  return count;
}
