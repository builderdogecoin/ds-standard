// SPDX-License-Identifier: Apache-2.0
// LAUNCH_DEPLOY collection records.
import { validateTag } from './tag.js';
import { isDogeAddress } from './base58.js';
import { verifySelfSigned } from './message.js';

/**
 * Check the shape of a LAUNCH_DEPLOY collection record:
 * {"ds":{"action":"LAUNCH_DEPLOY","ref":"dogesoft.io/lp_<slug>"},"name":…,"supply":…,
 *  "royalty_bps":…,"pay_to":"D…","sig":"…"}
 * royalty_bps is a whole percent in basis points (a multiple of 100, 0 to 10000).
 */
export function validateLaunchDeploy(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { ok: false, errors: ['body_not_object'] };
  const errors = [];
  const t = validateTag(record.ds);
  if (!t.ok) errors.push(...t.errors);
  else {
    if (t.action !== 'LAUNCH_DEPLOY') errors.push('not_launch_deploy');
    if (!t.refParts || t.refParts.kind !== 'collection') errors.push('ref_not_collection');
  }
  if (typeof record.name !== 'string' || record.name.length === 0) errors.push('name');
  if (!Number.isSafeInteger(record.supply) || record.supply < 1) errors.push('supply');
  const r = record.royalty_bps;
  if (!Number.isSafeInteger(r) || r < 0 || r > 10000 || r % 100 !== 0) errors.push('royalty_bps');
  if (!isDogeAddress(record.pay_to)) errors.push('pay_to');
  if (typeof record.sig !== 'string' || record.sig.length === 0) errors.push('sig');
  return errors.length ? { ok: false, errors } : { ok: true };
}

/** Shape check plus the creator's signmessage over "Doge Soft\n" + the record without sig. */
export function verifyLaunchDeploy(record, creator) {
  const shape = validateLaunchDeploy(record);
  if (!shape.ok) return shape;
  return verifySelfSigned(record, creator) ? { ok: true } : { ok: false, errors: ['bad_signature'] };
}
