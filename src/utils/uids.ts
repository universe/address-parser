import * as crypto from 'crypto';

import { Country, ISitus } from '@universe/models';

const md5 = (value: string) => crypto.createHash('md5').update(value).digest("hex")

const CACHE: Map<string, string> = new Map();
export function hash(addr: Partial<ISitus>): string {
  const val = [
    addr.number,
    addr.streetPreDir,
    addr.streetName,
    addr.streetPostDir,
    addr.unitNum,
    addr.zip,
  ].filter(Boolean).join();
  const hash = CACHE.get(val) || md5(val);
  CACHE.set(val, hash);
  return hash;
}

// TODO: Replace hash() with this implementation once geodata is migrated.
const HASH_CACHE: Map<string, string> = new Map();
export function unitHash(addr: Partial<ISitus>): string {
  const val = (addr.country && addr.country !== Country.USA)
    ? [
        addr.care,
        addr.country,
      ].join(':').toLowerCase().replace(/[-_/\\]/g, ' ').replace(/[^a-z0-9: ]/g, '')
    : [
        addr.number,
        addr.streetPreDir,
        addr.streetName,
        addr.streetType,
        addr.streetPostDir,
        addr.unitNum,
        addr.city,
        addr.state,
        addr.zip,
      ].join(':').toLowerCase().replace(/[-_/\\]/g, ' ').replace(/[^a-z0-9: ]/g, '');
  const hash = HASH_CACHE.get(val) || md5(val);
  HASH_CACHE.set(val, hash);
  return hash;
}

export function buildingHash(addr: Partial<ISitus>): string {
  const val = [
    addr.number,
    addr.streetPreDir,
    addr.streetName,
    addr.streetType,
    addr.streetPostDir,
  ].filter(Boolean).join(' ').toLowerCase().replace(/[-_/\\]/g, ' ').replace(/[^a-z0-9 ]/g, '');
  const hash = HASH_CACHE.get(val) || md5(val);
  HASH_CACHE.set(val, hash);
  return hash;
}
