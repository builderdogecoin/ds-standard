// SPDX-License-Identifier: Apache-2.0
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = fileURLToPath(new URL('../bin/ds.js', import.meta.url));
const run = (...args) => {
  try {
    return { code: 0, out: execFileSync(process.execPath, [bin, ...args], { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status, out: String(e.stdout) };
  }
};

test('ds check accepts a good note and refuses a lowercase one', () => {
  assert.equal(run('check', '{"ds":{"action":"BUY","ref":"dogesoft.io/r_1"}}').code, 0);
  const bad = run('check', '{"ds":{"action":"buy","ref":"dogesoft.io/r_1"}}');
  assert.equal(bad.code, 1);
  assert.match(bad.out, /action_not_uppercase/);
});

test('ds note and ds decode round trip', () => {
  const enc = JSON.parse(run('note', 'TIP', 'dogesoft.io/p_123').out);
  const dec = JSON.parse(run('decode', enc.scriptHex).out);
  assert.equal(dec.action, 'TIP');
  assert.equal(dec.ref, 'dogesoft.io/p_123');
});

test('ds verbs lists 29 verbs', () => {
  const out = run('verbs').out.trim().split('\n');
  assert.equal(out.length, 29);
});
