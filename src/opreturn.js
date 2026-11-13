// SPDX-License-Identifier: Apache-2.0
// The ds note as an OP_RETURN output script.
import { bytesToHex, hexToBytes, utf8 } from './bytes.js';
import { validateNoteText, makeTag } from './tag.js';

export const OP_RETURN = 0x6a;
export const OP_PUSHDATA1 = 0x4c;
/** At most 80 bytes of note data, one OP_RETURN per transaction. */
export const MAX_NOTE_BYTES = 80;

/**
 * Encode a note script: OP_RETURN, then one push of the UTF-8 JSON {"ds":{...}}.
 * The push is one length byte, or 0x4c and a length byte from 76 bytes up.
 * Returns { ok, scriptHex, bytes } or { ok: false, errors }.
 */
export function encodeNote(action, ref) {
  const text = JSON.stringify(makeTag(action, ref));
  const check = validateNoteText(text);
  if (!check.ok) return check;
  const data = utf8(text);
  if (data.length > MAX_NOTE_BYTES) return { ok: false, errors: ['note_too_big'] };
  const head = data.length <= 75 ? [OP_RETURN, data.length] : [OP_RETURN, OP_PUSHDATA1, data.length];
  return { ok: true, scriptHex: bytesToHex(Uint8Array.from([...head, ...data])), bytes: data.length };
}

/**
 * Decode an OP_RETURN output script into a ds tag.
 * Returns the validateTag result plus { text, bytes } on success.
 */
export function decodeNote(scriptHex) {
  let s;
  try { s = hexToBytes(scriptHex); } catch { return { ok: false, errors: ['not_hex'] }; }
  if (s.length === 0 || s[0] !== OP_RETURN) return { ok: false, errors: ['not_op_return'] };
  if (s.length === 1) return { ok: false, errors: ['no_push'] };
  let len, start;
  const op = s[1];
  if (op >= 1 && op <= 75) { len = op; start = 2; }
  else if (op === OP_PUSHDATA1) {
    if (s.length < 3) return { ok: false, errors: ['push_truncated'] };
    len = s[2]; start = 3;
    if (len < 76) return { ok: false, errors: ['push_not_minimal'] };
  } else return { ok: false, errors: ['push_form'] };
  if (start + len > s.length) return { ok: false, errors: ['push_truncated'] };
  if (start + len !== s.length) return { ok: false, errors: ['trailing_bytes'] };
  if (len > MAX_NOTE_BYTES) return { ok: false, errors: ['note_too_big'] };
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(s.slice(start)); }
  catch { return { ok: false, errors: ['not_utf8'] }; }
  const r = validateNoteText(text);
  return { ...r, text, bytes: len };
}
