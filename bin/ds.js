#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// ds: a tiny command line for the Doge Soft Standard. Much check. Very offline.
import { readFileSync } from 'node:fs';
import * as ds from '../src/index.js';

const [cmd, ...args] = process.argv.slice(2);
const print = (o) => console.log(JSON.stringify(o, (k, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
const input = (a) => (a === '-' ? readFileSync(0, 'utf8') : a && !a.trim().startsWith('{') && !/^[0-9a-f]+$/i.test(a) ? readFileSync(a, 'utf8') : a);
const done = (r) => { print(r); process.exit(r.ok ? 0 : 1); };

const help = `ds - the Doge Soft Standard, offline

  ds check  <json|file|->      check a note ({"ds":{...}}) or an inscription body with ds
  ds note   <ACTION> [ref]     build the OP_RETURN script for a note
  ds decode <script-hex>       read a note from an OP_RETURN script
  ds trade  <raw-tx-hex|file>  check a marketplace trade transaction
  ds verify <record.json|->    verify a signed record { record, signer, sig }
  ds verbs                     list every verb and its area
`;

switch (cmd) {
  case 'check': {
    const text = input(args[0]);
    let obj;
    try { obj = JSON.parse(text); } catch { done({ ok: false, errors: ['not_json'] }); }
    const onlyDs = obj && typeof obj === 'object' && Object.getOwnPropertyNames(obj).length === 1;
    done(onlyDs ? ds.validateNoteText(text) : ds.validateBody(obj));
    break;
  }
  case 'note': done(ds.encodeNote(args[0], args[1])); break;
  case 'decode': done(ds.decodeNote(args[0] ?? '')); break;
  case 'trade': done(ds.inspectTrade(input(args[0]).trim())); break;
  case 'verify': done(ds.verifyRecord(JSON.parse(input(args[0])))); break;
  case 'verbs': for (const a of ds.AREAS) for (const v of a.verbs) console.log(`${v}\t${a.area}`); break;
  default: process.stdout.write(help); process.exit(cmd ? 2 : 0);
}
