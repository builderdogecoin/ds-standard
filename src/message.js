// SPDX-License-Identifier: Apache-2.0
// Dogecoin signmessage verification, and the Doge Soft record message.
import { sha256d, hash160 } from './hash.js';
import { concat, utf8, varint, hexToBytes, bytesToBigInt } from './bytes.js';
import { base58CheckEncode, DOGE_P2PKH } from './base58.js';
import { recover, serializePoint } from './secp256k1.js';

const MAGIC = 'Dogecoin Signed Message:\n';

/** The prefix every Doge Soft record is signed under today. */
export const RECORD_PREFIX = 'Doge Soft\n';

/** Older inscribed records may still verify under these. */
export const LEGACY_PREFIXES = ['Doge Soft ref record\n', 'Doge Soft collection record\n'];

/** The 32-byte hash Dogecoin wallets sign for signmessage. */
export function messageHash(message) {
  const m = utf8(MAGIC);
  const b = utf8(message);
  return sha256d(concat(varint(m.length), m, varint(b.length), b));
}

/** The D-address that produced a base64 signmessage signature over message, or null. */
export function recoverAddress(message, sigBase64) {
  let sig;
  try {
    sig = Uint8Array.from(Buffer.from(String(sigBase64), 'base64'));
  } catch {
    return null;
  }
  if (sig.length !== 65) return null;
  const header = sig[0];
  if (header < 27 || header > 34) return null;
  const compressed = header >= 31;
  const recid = (header - 27) & 3;
  const r = bytesToBigInt(sig.slice(1, 33));
  const s = bytesToBigInt(sig.slice(33, 65));
  const e = bytesToBigInt(messageHash(message));
  const q = recover(e, r, s, recid);
  if (!q) return null;
  const point = hexToBytes(serializePoint(q, compressed));
  return base58CheckEncode(concat(Uint8Array.of(DOGE_P2PKH), hash160(point)));
}

/** True when sigBase64 is address's signmessage signature over message. */
export function verifyMessage(address, message, sigBase64) {
  return recoverAddress(message, sigBase64) === address;
}

/** The exact text a Doge Soft record is signed over. */
export function recordMessage(record, prefix = RECORD_PREFIX) {
  return prefix + JSON.stringify(record);
}

/**
 * Verify a signed record as the orbit serves it: { record, signer, sig }.
 * Tries the current prefix first, then the legacy prefixes.
 * Returns { ok, prefix, legacy } or { ok: false, reason }.
 */
export function verifyRecord(envelope) {
  if (!envelope || typeof envelope !== 'object') return { ok: false, reason: 'envelope_not_object' };
  const { record, signer, sig } = envelope;
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { ok: false, reason: 'record_not_object' };
  if (typeof signer !== 'string' || typeof sig !== 'string') return { ok: false, reason: 'signer_or_sig_missing' };
  for (const prefix of [RECORD_PREFIX, ...LEGACY_PREFIXES]) {
    if (verifyMessage(signer, recordMessage(record, prefix), sig)) {
      return { ok: true, prefix, legacy: prefix !== RECORD_PREFIX };
    }
  }
  return { ok: false, reason: 'bad_signature' };
}

/**
 * Verify a creator-signed record that carries its own `sig` (for example LAUNCH_DEPLOY):
 * the signature is over RECORD_PREFIX + the record JSON without `sig`.
 */
export function verifySelfSigned(record, signer) {
  if (!record || typeof record !== 'object' || typeof record.sig !== 'string') return false;
  const { sig, ...rest } = record;
  return verifyMessage(signer, recordMessage(rest), sig);
}
