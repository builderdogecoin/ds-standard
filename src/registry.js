// SPDX-License-Identifier: Apache-2.0
// The verb registry, loaded from schema/verbs.json so there is one source of truth.
import { readFileSync } from 'node:fs';

const registry = JSON.parse(readFileSync(new URL('../schema/verbs.json', import.meta.url), 'utf8'));

export const VERSION = registry.version;
export const AREAS = registry.areas;

const byVerb = new Map();
for (const a of AREAS) for (const v of a.verbs) byVerb.set(v, a.area);

/** All verbs, in registry order. */
export const VERBS = AREAS.flatMap((a) => a.verbs);

/** The area a verb belongs to, or null for an unknown verb. */
export function areaOf(verb) {
  return byVerb.get(verb) ?? null;
}

export const isVerb = (v) => byVerb.has(v);
