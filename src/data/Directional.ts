import { aliases,Directional } from '@universe/models';

const HumanReadableDirs = {
  [Directional.N]: 'North',
  [Directional.S]: 'South',
  [Directional.W]: 'West',
  [Directional.E]: 'East',
  [Directional.NW]: 'Northwest',
  [Directional.NE]: 'Northeast',
  [Directional.SW]: 'Southwest',
  [Directional.SE]: 'Southeast',
};

export function toDirectional(dir: string): Directional {
  return aliases.DirectionalLookup[dir.toUpperCase()];
}

export function directionalString(dir: Directional | null): string | null {
  if (dir === null) {
    return null;
  }
  dir = toDirectional(dir);
  return HumanReadableDirs[dir];
}

export function isDirectional(dir: string): dir is Directional {
  return !!aliases.DirectionalLookup[dir.toUpperCase()];
}
