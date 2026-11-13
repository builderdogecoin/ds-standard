// SPDX-License-Identifier: Apache-2.0
// The ds tag: {"ds":{"action":"<VERB>","ref":"<domain>/<local>"}}.
import { areaOf } from './registry.js';

/** The ref domain that issues records. */
export const DOMAINS = ['dogesoft.io'];
export const DEFAULT_DOMAIN = 'dogesoft.io';

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isPlainObject = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);

/**
 * Split a ref into its parts.
 * `<domain>/<local>`, or a bare legacy ref with no domain (resolved on dogesoft.io).
 * Returns { ok, domain, local, bare, kind } or { ok: false, error }.
 */
export function parseRef(ref) {
  if (typeof ref !== 'string') return { ok: false, error: 'ref_not_string' };
  if (ref.length === 0) return { ok: false, error: 'ref_empty' };
  if (/[\s\u0000-\u001f\u007f]/.test(ref)) return { ok: false, error: 'ref_format' };
  const slash = ref.indexOf('/');
  let domain, local, bare;
  if (slash === -1) {
    domain = DEFAULT_DOMAIN; local = ref; bare = true;
  } else {
    domain = ref.slice(0, slash); local = ref.slice(slash + 1); bare = false;
    if (!domain || !local) return { ok: false, error: 'ref_format' };
    if (!DOMAINS.includes(domain)) return { ok: false, error: 'ref_domain' };
  }
  let kind = 'other';
  if (local.startsWith('r_')) {
    if (!/^r_[0-9]+$/.test(local)) return { ok: false, error: 'ref_local' };
    kind = 'sale';
  } else if (local.startsWith('lp_')) {
    if (local.length === 3) return { ok: false, error: 'ref_local' };
    kind = 'collection';
  }
  return { ok: true, domain, local, bare, kind };
}

/**
 * Validate the object that sits under "ds".
 * Returns { ok: true, action, ref?, area, refParts? } or { ok: false, errors: [codes] }.
 */
export function validateTag(ds) {
  if (!isPlainObject(ds)) return { ok: false, errors: ['ds_not_object'] };
  const errors = [];
  for (const name of Object.getOwnPropertyNames(ds)) {
    if (name !== 'action' && name !== 'ref') { errors.push('ds_extra_field'); break; }
  }
  const { action } = ds;
  let area = null;
  if (typeof action !== 'string' || action.length === 0) {
    errors.push('action_missing');
  } else if (!/^[A-Z0-9_]+$/.test(action)) {
    errors.push('action_not_uppercase');
  } else if (!(area = areaOf(action))) {
    errors.push('action_unknown');
  }
  let refParts;
  if (hasOwn(ds, 'ref')) {
    refParts = parseRef(ds.ref);
    if (!refParts.ok) errors.push(refParts.error);
  }
  // Area rules from the standard.
  if (area === 'Social' && !refParts) errors.push('ref_required');
  if (action === 'BRIDGE_L1_DEPOSIT' || action === 'BRIDGE_L1_RELEASE') {
    if (!refParts) errors.push('ref_required');
  }
  if (action === 'BRIDGE_L1_DEPOSIT' && refParts?.ok && !/^0x[0-9a-fA-F]{64}$/.test(ds.ref)) {
    errors.push('bridge_ref_format');
  }
  if (errors.length) return { ok: false, errors };
  const out = { ok: true, action, area };
  if (refParts) { out.ref = ds.ref; out.refParts = refParts; }
  return out;
}

/**
 * Validate an inscription body (or any JSON object) that carries a ds field,
 * such as a DRC-20 transfer, a LAUNCH_DEPLOY record or a governance body.
 * Accepts an object or JSON text.
 */
export function validateBody(body) {
  let obj = body;
  if (typeof body === 'string') {
    try { obj = JSON.parse(body); } catch { return { ok: false, errors: ['not_json'] }; }
  }
  if (!isPlainObject(obj)) return { ok: false, errors: ['body_not_object'] };
  if (!hasOwn(obj, 'ds')) return { ok: false, errors: ['ds_missing'] };
  return validateTag(obj.ds);
}

/**
 * Validate the text of an OP_RETURN note. The note is exactly {"ds":{...}}:
 * nothing else sits beside ds in a note.
 */
export function validateNoteText(text) {
  let obj;
  try { obj = JSON.parse(text); } catch { return { ok: false, errors: ['not_json'] }; }
  if (!isPlainObject(obj)) return { ok: false, errors: ['body_not_object'] };
  const names = Object.getOwnPropertyNames(obj);
  if (!names.includes('ds')) return { ok: false, errors: ['ds_missing'] };
  if (names.length !== 1) return { ok: false, errors: ['note_extra_field'] };
  return validateTag(obj.ds);
}

/** Build the canonical tag object: action first, then ref when given. */
export function makeTag(action, ref) {
  const ds = { action };
  if (ref !== undefined) ds.ref = ref;
  return { ds };
}
