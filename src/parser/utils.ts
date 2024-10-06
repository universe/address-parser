import { Token } from './tokenizer.js';

const alphas = new Set([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',

  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]);

const decimals = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
]);

const forceLowerCase = new Set([
  'an', 'the', 'of', 'and', 'but', 'for', 'at', 'by', 'from', 'in', 'on',
]);

export function titleCase(str: string): string {
  str = str.toLowerCase().trim();

  if (forceLowerCase.has(str)) {
    return str;
  }

  for (let i = 0; i < str.length; i++) {
    if (i - 1 < 0 || (!alphas.has(str[i - 1]) && alphas.has(str[i]))) {
      str = str.slice(0, i) + str[i].toUpperCase() + str.slice(i + 1);
    }
  }

  // Ordinals don't get titled.
  str = str.replace(/(\d)St/g, '$1st');
  str = str.replace(/(\d)Nd/g, '$1nd');
  str = str.replace(/(\d)Rd/g, '$1rd');
  str = str.replace(/(\d)Th/g, '$1th');

  return str;
}

export function isNumerical(str: string): boolean {
  let isNumber = true;
  for (let i = 0; i < str.length; i++) {
    isNumber = isNumber && decimals.has(str[i]);
  }
  return isNumber;
}

const ordinals = {
  FIRST: '1st',
  SECOND: '2nd',
  THIRD: '3rd',
  FOURTH: '4th',
  FIFTH: '5th',
  SIXTH: '6th',
  SEVENTH: '7th',
  EIGHTH: '8th',
  NINTH: '9th',
  TENTH: '10th',
  ELEVENTH: '11th',
  TWELFTH: '12th',
  THIRTEENTH: '13th',
  FOURTEENTH: '14th',
  FIFTEENTH: '15th',
};

const ORDINAL_MAP: Map<string, string> = new Map();
for (const [ key, value ] of Object.entries(ordinals)) {
  ORDINAL_MAP.set(key.toUpperCase(), value.toUpperCase());
  ORDINAL_MAP.set(value.toUpperCase(), key.toUpperCase());
}

export function isOrdinal(str: string | null): boolean {
  return !!(str && str.match(/[0-9]+(st|nd|rd|th)/i));
}

export function isOrder(val: string): boolean {
  return !!(ordinals[val.toUpperCase() as keyof typeof ordinals] && ORDINAL_MAP.has(val.toUpperCase()));
}

export function ordinalToOrder(val: string): string {
  if (!isOrdinal(val)) { return val; }
  return titleCase(ORDINAL_MAP.get(val.toUpperCase()) || val);
}

export function orderToOrdinal(val: string): string {
  if (!isOrder(val)) { return val; }
  return titleCase(ORDINAL_MAP.get(val.toUpperCase()) || val);
}

export function normalize(str: string): string {
  if (!str) { return ''; }
  return String(str).toUpperCase();
}

// Unit numbers should always have numbers followed by letters and be sentence case
export function normalizeUnitNum(tokens: Token[]): string | null {
  const out = [];
  const suffix = [];
  for (const token of tokens) {
    if (!isOrdinal(token.value)) {
      // Push single character prefixes to the end
      if (token.decimals && token.alphas === 1 && /[a-z]/i.test(token.value[0])) {
        suffix.push(token.value[0].toUpperCase());
        suffix.push(' ');
        token.value = token.value.slice(1);
        token.alphas = 0;
      }

      // Push double character prefixes to the end
      if (token.decimals && token.alphas === 2 && /[a-z]/i.test(token.value[0]) && /[a-z]/i.test(token.value[1])) {
        suffix.push(token.value[0].toUpperCase());
        suffix.push(token.value[1].toUpperCase());
        suffix.push(' ');
        token.value = token.value.slice(1);
        token.alphas = 0;
      }

      // Push single character suffixes to the end
      if (token.decimals && token.alphas === 1 && /[a-z]/i.test(token.value[token.value.length - 1])) {
        suffix.push(token.value[token.value.length - 1].toUpperCase());
        suffix.push(' ');
        token.value = token.value.slice(0, -1);
        token.alphas = 0;
      }

      // Push double character suffixes to the end
      if (token.decimals && token.alphas === 2 && /[a-z]/i.test(token.value[token.value.length - 1]) && /[a-z]/i.test(token.value[token.value.length - 2])) {
        suffix.push(token.value[token.value.length - 2].toUpperCase());
        suffix.push(token.value[token.value.length - 1].toUpperCase());
        suffix.push(' ');
        token.value = token.value.slice(0, -2);
        token.alphas = 0;
      }
    }

    const value = (token.decimals && token.alphas) ? isOrdinal(token.value) ? token.value.toLowerCase() : token.value.toUpperCase() : titleCase(token.value);

    // All alpha codes are put on the suffix and upper cased.
    if (!token.decimals && value.length <= 3) {
      suffix.push(value.toUpperCase());
      switch (token.separator) {
        case '-': suffix.push('-'); break;
        default: suffix.push(' ');
      }
    }

    else {
      out.push(value);
      switch (token.separator) {
        case '#': out.push(' # '); break;
        case '.': out.push('.'); break;
        case '&': out.push(' & '); break;
        case ',': out.push(' '); break;
        case '-': out.push('-'); break;
        case '/': out.push('/'); break;
        default: out.push('');
      }
    }
  }

  suffix.pop();
  out.pop();

  // Ordinals don't get titled.
  return [ ...out, ...suffix ].join('').trim().replace(/(\d)St/gi, '$1st').replace(/(\d)Nd/gi, '$1nd').replace(/(\d)Rd/gi, '$1rd').replace(/(\d)Th/gi, '$1th');
}

export function normalizeHouseNum(str: string | null): string | null {
  if (str === null) { return null; }
  str = str.toUpperCase();
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const prev = str[i - 1];
    const char = str[i];
    const next = str[i + 1];
    // Place a space between decimals and alphas
    if ((decimals.has(prev) && alphas.has(char)) || (alphas.has(prev) && decimals.has(char))) {
      // out += ` ${char}`;
    }
    // Remove unnecessary dashes between decimals and alphas
    if (char === '-' && (decimals.has(prev) && alphas.has(next))) {
      out += ' ';
    }
    else {
      out += char;
    }
  }

  return out.trim();
}
