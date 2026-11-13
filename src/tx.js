// SPDX-License-Identifier: Apache-2.0
// A tiny reader for Dogecoin transactions, enough to find the ds note
// and read the sighash type each input was signed with.
import { hexToBytes, bytesToHex } from './bytes.js';
import { sha256d } from './hash.js';
import { decodeNote, OP_RETURN } from './opreturn.js';
import { areaOf } from './registry.js';

export const SIGHASH_ALL = 0x01;
export const SIGHASH_SINGLE_ANYONECANPAY = 0x83;

function reader(b) {
  let o = 0;
  const need = (n) => { if (o + n > b.length) throw new Error('transaction truncated'); };
  const r = {
    u8() { need(1); return b[o++]; },
    u32() { need(4); const v = b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24); o += 4; return v >>> 0; },
    u64() { need(8); let v = 0n; for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[o + i]); o += 8; return v; },
    bytes(n) { need(n); const s = b.slice(o, o + n); o += n; return s; },
    varint() {
      const f = r.u8();
      if (f < 0xfd) return f;
      if (f === 0xfd) { need(2); const v = b[o] | (b[o + 1] << 8); o += 2; return v; }
      if (f === 0xfe) return r.u32();
      return Number(r.u64());
    },
    get offset() { return o; },
  };
  return r;
}

/** Parse a raw transaction hex. Dogecoin transactions carry no witness data. */
export function parseTx(hex) {
  const raw = hexToBytes(hex);
  const r = reader(raw);
  const version = r.u32();
  const nin = r.varint();
  if (nin === 0) throw new Error('no inputs (witness serialization is not used on Dogecoin)');
  const vin = [];
  for (let i = 0; i < nin; i++) {
    const prevTxid = bytesToHex(r.bytes(32).reverse());
    const prevVout = r.u32();
    const scriptSig = bytesToHex(r.bytes(r.varint()));
    const sequence = r.u32();
    vin.push({ prevTxid, prevVout, scriptSig, sequence });
  }
  const nout = r.varint();
  const vout = [];
  for (let i = 0; i < nout; i++) {
    const value = r.u64();
    const script = bytesToHex(r.bytes(r.varint()));
    vout.push({ n: i, value, script });
  }
  const locktime = r.u32();
  if (r.offset !== raw.length) throw new Error('trailing bytes after locktime');
  const txid = bytesToHex(sha256d(raw).reverse());
  return { txid, version, vin, vout, locktime };
}

/** The sighash type byte of the first signature push in a scriptSig, or null. */
export function sighashOf(scriptSigHex) {
  const s = hexToBytes(scriptSigHex);
  if (s.length < 2) return null;
  let len = s[0], start = 1;
  if (len === 0x4c) { len = s[1]; start = 2; }
  if (len < 9 || len > 73 || start + len > s.length) return null;
  const sig = s.slice(start, start + len);
  if (sig[0] !== 0x30) return null; // DER signature
  return sig[sig.length - 1];
}

/**
 * Find the ds note in a transaction. One OP_RETURN per transaction.
 * Returns { ok, vout, value, tag... } or { ok: false, errors }.
 */
export function findNote(tx) {
  const notes = tx.vout.filter((o) => o.script.startsWith(OP_RETURN.toString(16)));
  if (notes.length === 0) return { ok: false, errors: ['no_op_return'] };
  if (notes.length > 1) return { ok: false, errors: ['multiple_op_return'] };
  const out = notes[0];
  const d = decodeNote(out.script);
  return { ...d, vout: out.n, value: out.value };
}

/**
 * Check a marketplace trade transaction against the standard:
 * - exactly one OP_RETURN, carrying a valid marketplace tag
 * - the tag sits after the seller's payment output (output 1)
 * - the seller's input 1 is signed SIGHASH_SINGLE|ANYONECANPAY (0x83)
 * - the buyer's inputs are signed SIGHASH_ALL (0x01)
 */
export function inspectTrade(hex) {
  const tx = parseTx(hex);
  const note = findNote(tx);
  const sighashes = tx.vin.map((i) => sighashOf(i.scriptSig));
  const checks = {
    note: note.ok,
    marketplaceVerb: note.ok && areaOf(note.action) === 'Marketplace',
    noteAfterSellerOutput: note.ok && note.vout > 1,
    noteZeroValue: note.ok && note.value === 0n,
    sellerInput1Single: sighashes[1] === SIGHASH_SINGLE_ANYONECANPAY,
    buyerInputsAll: sighashes.length > 1 && sighashes.every((h, i) => i === 1 || h === SIGHASH_ALL),
  };
  const ok = Object.values(checks).every(Boolean);
  return { ok, txid: tx.txid, note, sighashes, checks };
}
