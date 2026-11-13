# Signed records: check one yourself

Every `ref` names a record. The record says what happened in full (for a sale: the inscription, price, seller, buyer and the transaction). The tag on chain stays tiny; the record carries the detail, and a signature makes it checkable.

## The message

The signature is a standard Dogecoin `signmessage` over the text `Doge Soft`, a newline, then the JSON of the record:

```js
const message = 'Doge Soft\n' + JSON.stringify(record);
```

The JSON is the record **exactly as served**. Field order matters: the same fields in another order are a different message, and the signature fails.

## Fetch one

```bash
curl -s https://marketplace.dogesoft.io/ds/ref/r_6
```

```json
{
  "record": {
    "ref": "r_6",
    "action": "BUY",
    "actor": "DEpXQrzfRfM4KN7sC2ne557CWtRpH2tySH",
    "target": "2b08f61ae9e541cacef1f399062b4fe4803cf786e1cce79a24aafcc5fa9b9531i0",
    "body": { "inscription": "…", "tick": "dmmg", "amount": "1000", "price": 100000000, "seller": "D…", "buyer": "D…" },
    "proof": "tx:04d3e5ffba0fe45f8080f04914ebd17a093a58445e6b3ce773f129712d506aaa",
    "txid": "04d3e5ffba0fe45f8080f04914ebd17a093a58445e6b3ce773f129712d506aaa",
    "ts": 1794478531,
    "state": "confirmed"
  },
  "signer": "D9m4ufeHBjLSR8tStQopLs8BQBVoDzbQtw",
  "sig": "ID4DoM8a3IX924z8MTRR8gSbC1w8sETKvfv+edgYMzgZdO+szRk/P/wdFzzcs5xU4SjrcR5n6K0ewtycDNhR2C0=",
  "message_prefix": "Doge Soft\n",
  "signed": "message_prefix + JSON.stringify(record)"
}
```

## Check it, three ways

1. **Any Dogecoin wallet.** Use *verify message* with the `signer` address, the `sig`, and the message above.
2. **Dogecoin Core.** `dogecoin-cli verifymessage <signer> <sig> "<message>"` (mind the newline and the exact JSON).
3. **The reference verifier** in this repo, zero dependencies:

   ```bash
   curl -s https://marketplace.dogesoft.io/ds/ref/r_6 | node bin/ds.js verify -
   ```

   ```json
   { "ok": true, "prefix": "Doge Soft\n", "legacy": false }
   ```

Then close the loop on chain: the record's `txid` is the trade, and that trade's `OP_RETURN` note names the same ref.

## Legacy prefixes

Older inscribed records may still verify under the previous prefixes `Doge Soft ref record` and `Doge Soft collection record`. The reference verifier tries the current prefix first, then those, and tells you which one matched (`legacy: true`).

## Who signs

Doge Soft signs these records. A partner record uses the same `signmessage` when the orbit issues one. A creator-signed `LAUNCH_DEPLOY` carries its own `sig` over `Doge Soft`, a newline, then the record without `sig` ([launchpad.md](verbs/launchpad.md)).

## How it works under the hood

`signmessage` hashes `"\x19Dogecoin Signed Message:\n"`, the message length and the message with double SHA-256, then signs with a 65-byte recoverable signature. Verifying recovers the public point, hashes it to a D-address, and compares with `signer`. [`src/message.js`](../src/message.js) does exactly that in about 100 lines, with no libraries.
