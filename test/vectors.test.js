// SPDX-License-Identifier: Apache-2.0
// Runs every published vector in vectors/. If one fails, the parser and the standard disagree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as ds from '../src/index.js';

const load = (f) => JSON.parse(readFileSync(new URL(`../vectors/${f}`, import.meta.url), 'utf8'));
const errs = (r) => (r.ok ? [] : r.errors);

test('tags.json', async (t) => {
  for (const v of load('tags.json').vectors) {
    await t.test(v.name, () => {
      const r = v.kind === 'note' ? ds.validateNoteText(v.input) : ds.validateBody(v.input);
      assert.equal(r.ok, v.valid);
      assert.deepEqual(errs(r), v.errors);
    });
  }
});

test('op-return.json: decode', async (t) => {
  for (const v of load('op-return.json').decode) {
    await t.test(v.name, () => {
      const r = ds.decodeNote(v.script);
      assert.equal(r.ok, v.valid);
      assert.deepEqual(errs(r), v.errors);
      if (v.valid && v.text) assert.equal(r.text, v.text);
      if (v.valid && v.bytes) assert.equal(r.bytes, v.bytes);
    });
  }
});

test('op-return.json: encode', async (t) => {
  for (const v of load('op-return.json').encode) {
    await t.test(`${v.action} ${v.ref}`, () => {
      const r = ds.encodeNote(v.action, v.ref);
      assert.ok(r.ok);
      assert.equal(r.scriptHex, v.script);
      assert.ok(ds.decodeNote(r.scriptHex).ok);
    });
  }
});

test('transactions.json', async (t) => {
  for (const v of load('transactions.json').vectors) {
    await t.test(v.name, () => {
      const r = ds.inspectTrade(v.hex);
      assert.equal(r.txid, v.txid, 'txid is the double SHA-256 of the raw transaction');
      assert.equal(r.ok, v.expect.ok);
      assert.equal(r.note.action, v.expect.action);
      assert.equal(r.note.ref, v.expect.ref);
      assert.equal(r.note.vout, v.expect.note_vout);
      assert.equal(r.note.text, v.expect.note_text);
      assert.deepEqual(r.sighashes, v.expect.sighashes);
      assert.equal(r.sighashes[1], ds.SIGHASH_SINGLE_ANYONECANPAY);
    });
  }
});

test('records.json', async (t) => {
  for (const v of load('records.json').vectors) {
    await t.test(v.name, () => {
      const r = ds.verifyRecord(v.envelope);
      assert.equal(r.ok, v.valid);
      if (v.valid) assert.equal(r.prefix, ds.RECORD_PREFIX);
    });
  }
});

test('launch-deploy.json', async (t) => {
  for (const v of load('launch-deploy.json').vectors) {
    await t.test(v.name, () => {
      const r = ds.validateLaunchDeploy(v.record);
      assert.equal(r.ok, v.valid);
      assert.deepEqual(errs(r), v.errors);
    });
  }
});

test('governance-tally.json', async (t) => {
  for (const v of load('governance-tally.json').vectors) {
    await t.test(v.name, () => {
      const r = ds.tally(v.input);
      assert.equal(r.quorum, v.expect.quorum);
      assert.equal(r.passed, v.expect.passed);
    });
  }
});
