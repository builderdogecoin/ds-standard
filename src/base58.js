// SPDX-License-Identifier: Apache-2.0
// Base58Check, used by Dogecoin addresses.
import { sha256d } from './hash.js';
import { concat, bytesToBigInt } from './bytes.js';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Encode(bytes) {
  let n = bytesToBigInt(bytes);
  let s = '';
  while (n > 0n) { s = ALPHABET[Number(n % 58n)] + s; n /= 58n; }
  for (const b of bytes) { if (b !== 0) break; s = '1' + s; }
  return s;
}

export function base58Decode(str) {
  let n = 0n;
  for (const c of str) {
    const i = ALPHABET.indexOf(c);
    if (i < 0) throw new Error('bad base58 character');
    n = n * 58n + BigInt(i);
  }
  let hex = n === 0n ? '' : n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const body = hex.match(/../g)?.map((h) => parseInt(h, 16)) ?? [];
  let lead = 0;
  for (const c of str) { if (c !== '1') break; lead++; }
  return Uint8Array.from([...new Array(lead).fill(0), ...body]);
}

export function base58CheckEncode(payload) {
  return base58Encode(concat(payload, sha256d(payload).slice(0, 4)));
}

export function base58CheckDecode(str) {
  const raw = base58Decode(str);
  if (raw.length < 5) throw new Error('too short');
  const payload = raw.slice(0, -4);
  const check = sha256d(payload).slice(0, 4);
  for (let i = 0; i < 4; i++) if (check[i] !== raw[raw.length - 4 + i]) throw new Error('bad checksum');
  return payload;
}

/** Dogecoin mainnet P2PKH ("D-address") version byte. */
export const DOGE_P2PKH = 0x1e;

export function isDogeAddress(addr) {
  if (typeof addr !== 'string' || !/^D[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(addr)) return false;
  try {
    const p = base58CheckDecode(addr);
    return p.length === 21 && p[0] === DOGE_P2PKH;
  } catch {
    return false;
  }
}
