import { aliases,State } from '@universe/models';

import { normalize } from '../parser/utils.js';

const StateMappings: { [key: string]: State } = {};
for (const abbr of Object.keys(aliases.State) as State[]) {
  StateMappings[abbr] = abbr;
  for (const str of aliases.State[abbr]) {
    StateMappings[normalize(str)] = abbr;
  }
}

export function stateString(state: State): string {
  return aliases.State[normalize(state) as State][0];
}

export function isState(str: string): str is State {
  return !!StateMappings[normalize(str)];
}

export function toState(str: string): State | null {
  return StateMappings[normalize(str)] || null;
}
