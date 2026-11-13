// SPDX-License-Identifier: Apache-2.0
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as ds from '../src/index.js';
import { ripemd160, sha256 } from '../src/hash.js';
import { base58CheckDecode, base58CheckEncode } from '../src/base58.js';
import { bytesToHex, utf8 } from '../src/bytes.js';

test('registry: 29 verbs in 6 areas, in the documented counts', () => {
  const counts = Object.fromEntries(ds.AREAS.map((a) => [a.area, a.verbs.length]));
  assert.deepEqual(counts, { Marketplace: 7, Social: 3, Launchpad: 2, Governance: 12, Security: 2, Bridge: 3 });
  assert.equal(ds.VERBS.length, 29);
  assert.equal(new Set(ds.VERBS).size, 29, 'no verb is listed twice');
  for (const v of ds.VERBS) assert.match(v, /^[A-Z0-9_]+$/);
});

test('schema enums match the registry', () => {
  const tag = JSON.parse(readFileSync(new URL('../schema/ds-tag.schema.json', import.meta.url), 'utf8'));
  assert.deepEqual(tag.properties.action.enum, ds.VERBS);
  for (const f of ['ds-tag', 'ds-note', 'ref-record', 'launch-deploy']) {
    const s = JSON.parse(readFileSync(new URL(`../schema/${f}.schema.json`, import.meta.url), 'utf8'));
    assert.equal(s.$schema, 'https://json-schema.org/draft/2020-12/schema');
  }
});

test('RIPEMD-160 known answers', () => {
  assert.equal(bytesToHex(ripemd160(utf8(''))), '9c1185a5c5e9fc54612808977ee8f548b2258d31');
  assert.equal(bytesToHex(ripemd160(utf8('abc'))), '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc');
  assert.equal(bytesToHex(ripemd160(utf8('message digest'))), '5d0689ef49d2fae572b881b123a85ffa21595f36');
  assert.equal(bytesToHex(ripemd160(utf8('a'.repeat(1000000)))), '52783243c1697bdbe16d37f97f68f08325dc1528');
});

test('SHA-256 known answer', () => {
  assert.equal(bytesToHex(sha256(utf8('abc'))), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('Base58Check round trip and D-addresses', () => {
  const a = 'D9m4ufeHBjLSR8tStQopLs8BQBVoDzbQtw';
  assert.equal(base58CheckEncode(base58CheckDecode(a)), a);
  assert.ok(ds.isDogeAddress(a));
  assert.ok(!ds.isDogeAddress(a.slice(0, -1) + 'u'));
  assert.ok(!ds.isDogeAddress('1BoatSLRHtKNngkdXEeobR76b53LETtpyT'));
});

test('parseRef', () => {
  assert.deepEqual(ds.parseRef('dogesoft.io/r_1'), { ok: true, domain: 'dogesoft.io', local: 'r_1', bare: false, kind: 'sale' });
  assert.deepEqual(ds.parseRef('dogesoft.io/lp_moon-dogs'), { ok: true, domain: 'dogesoft.io', local: 'lp_moon-dogs', bare: false, kind: 'collection' });
  assert.deepEqual(ds.parseRef('r_2'), { ok: true, domain: 'dogesoft.io', local: 'r_2', bare: true, kind: 'sale' });
  assert.deepEqual(ds.parseRef('example.com/p_123'), { ok: false, error: 'ref_domain' });
});

test('encodeNote picks the right push and refuses 81 bytes', () => {
  const short = ds.encodeNote('BUY', 'dogesoft.io/r_1');
  assert.ok(short.scriptHex.startsWith('6a2f'));
  const id33 = 'p_' + 'x'.repeat(31);
  const long = ds.encodeNote('REVEAL', `dogesoft.io/${id33}`);
  assert.equal(long.bytes, 80);
  assert.ok(long.scriptHex.startsWith('6a4c50'));
  assert.deepEqual(ds.encodeNote('REVEAL', `dogesoft.io/${id33}x`).errors, ['note_too_big']);
  assert.deepEqual(ds.encodeNote('buy', 'dogesoft.io/r_1').errors, ['action_not_uppercase']);
});

test('makeTag keeps action first and ref second', () => {
  assert.equal(JSON.stringify(ds.makeTag('BUY', 'dogesoft.io/r_1')), '{"ds":{"action":"BUY","ref":"dogesoft.io/r_1"}}');
  assert.equal(JSON.stringify(ds.makeTag('GOV_VOTE')), '{"ds":{"action":"GOV_VOTE"}}');
});

test('a transaction with two OP_RETURN outputs carries no valid note', () => {
  const t = JSON.parse(readFileSync(new URL('../vectors/transactions.json', import.meta.url), 'utf8')).vectors[0];
  const tx = ds.parseTx(t.hex);
  tx.vout.push({ ...tx.vout.at(-1), n: tx.vout.length });
  assert.deepEqual(ds.findNote(tx).errors, ['multiple_op_return']);
});

test('ballot commitment is SHA-256 over sorted tab-separated lines', () => {
  const b = [
    { inscription_id: 'bbi0', voter: 'D2', choice: 'no', weight: 1 },
    { inscription_id: 'aai0', voter: 'D1', choice: 'yes', weight: 1 },
  ];
  const expected = bytesToHex(sha256(utf8('aai0\tD1\tyes\t1\nbbi0\tD2\tno\t1\n')));
  assert.equal(ds.ballotCommitment(b), expected);
});

test('chain order: height, then txid, then inscription index', () => {
  const xs = [
    { height: 2, txid: 'aa', index: 0 },
    { height: 1, txid: 'bb', index: 1 },
    { height: 1, txid: 'bb', index: 0 },
    { height: 1, txid: 'aa', index: 5 },
  ].sort(ds.compareChainOrder);
  assert.deepEqual(xs.map((x) => `${x.height}:${x.txid}:${x.index}`), ['1:aa:5', '1:bb:0', '1:bb:1', '2:aa:0']);
});
