# Build on the Doge Soft Standard

Much welcome, builder. Here's the whole thing on one page.

## Read tags

1. For every transaction, look for **one** `OP_RETURN` output. More than one means no valid note.
2. Decode it: `OP_RETURN`, one push (a length byte, or `0x4c` and a length byte from 76 bytes up), at most 80 bytes of UTF-8 JSON, nothing after.
3. The JSON must be exactly `{"ds":{"action":…,"ref":…}}`. The action must be UPPERCASE and in the registry. Nothing else inside `ds`.
4. For inscription bodies (DRC-20 transfers, `LAUNCH_DEPLOY`, governance), read `ds` beside the protocol's own fields, with the same tag rules.
5. Count a tag only on a real on-chain move, and a DRC-20 tag only on a transfer that is valid under the strict DRC-20 rules.

```js
import { parseTx, findNote, validateBody } from './src/index.js';

const note = findNote(parseTx(rawTxHex));          // { ok, action, ref, vout, ... }
const body = validateBody(inscriptionText);        // for bodies that carry ds
```

## Write tags

```js
import { encodeNote } from './src/index.js';

const { scriptHex } = encodeNote('BUY', 'dogesoft.io/r_1');
// Add a 0-value output with this script after the seller's payment output.
```

For a marketplace trade:

- The seller signs their input with `SIGHASH_SINGLE|ANYONECANPAY` (`0x83`) on their payment output.
- Add the tag output before the buyer signs. The buyer signs `SIGHASH_ALL` (`0x01`), which commits to the tag.
- Listings, offers, bids and cancels stay signed records in your own book. They never get a tag.
- Royalties come from the collection's `LAUNCH_DEPLOY` record, never from the tag.

## Signing with the Doge Soft wallet

`window.dogesoft.signPsbt(psbt, options)` returns `{ hex, psbtHex, signedPsbtHex, psbtBase64, signedPsbtBase64, txHex? }`.

- `hex`, `psbtHex` and `signedPsbtHex` are the signed PSBT in hex; `psbtBase64` and `signedPsbtBase64` are the same PSBT in base64.
- `txHex` is the broadcast-ready raw transaction, returned when `finalize` or `autoFinalize` is set and every input is signed.

See [PSBTs](https://docs.dogesoft.io/wallet/psbt/) in the wallet docs.

## Check refs

Fetch the record for a ref and verify the signature ([records.md](records.md)). Then check that the record's transaction is the one carrying the tag.

## Test your implementation

Port the vectors, not the code. Every file in [`vectors/`](../vectors/) is plain JSON with the expected result. If your parser agrees with all of them, it agrees with the standard. Run ours with `npm test`.

## Want a new verb?

Write a [Such Verb Proposal](../proposals/README.md).
