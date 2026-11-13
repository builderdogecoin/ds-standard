# 🛒 Marketplace verbs

`BUY` `AUCTION_SOLD` `OFFER_ACCEPT` `GIFT` `BUNDLE` `PARTIAL_FILL` `COLLECTION_TRANSFER`

Anyone can run a marketplace on these seven verbs. The tag goes on the one transaction that spends the dog. One tag covers both sides: price, seller and buyer are the outputs of that transaction.

## The note

```json
{"ds":{"action":"BUY","ref":"dogesoft.io/r_1"}}
```

Same shape for every verb. It is one `OP_RETURN` of at most 80 bytes, appended after the seller's payment output.

| Verb | Means |
|---|---|
| `BUY` | A buy-now sale |
| `AUCTION_SOLD` | An auction settled |
| `OFFER_ACCEPT` | The holder accepted an offer |
| `GIFT` | A transfer with no price |
| `BUNDLE` | Several dogs in one sale; names every dog those inputs moved |
| `PARTIAL_FILL` | Part of a listing filled; names every dog those inputs moved |
| `COLLECTION_TRANSFER` | A collection moved; names every dog those inputs moved |

The ref is the long form of that sale. Doge Soft signs that record with a Dogecoin `signmessage` after the outputs check. See [records.md](../records.md).

## What never gets a tag

A listing, offer, bid or cancel is a signed record in that marketplace's own book. It is not an inscription, and it does not get a tag. Moving the dog anywhere else ends the listing.

## Who signs

| Who | Sighash |
|---|---|
| Seller | `SIGHASH_SINGLE\|ANYONECANPAY` (`0x83`) on their payment output |
| Buyer, bidder or offer signer | `SIGHASH_ALL` (`0x01`) |

Because the buyer signs `SIGHASH_ALL`, the tag is already in the template before they sign, and nobody can change it afterwards.

## A real trade

Transaction `e5517e54…8815` at block 6,425,117 (in [`vectors/transactions.json`](../../vectors/transactions.json)):

| | Input | Output |
|---|---|---|
| 0 | Buyer's dummy coin, `0x01` | Buyer receives dummy + carrier, so the Doginal lands here |
| 1 | Seller's carrier, `0x83` | Seller's signed amount |
| 2 | Buyer's payment, `0x01` | … royalty, fee, dummy and change outputs … |
| 6 | | `OP_RETURN {"ds":{"action":"BUY","ref":"r_2"}}`, 0 value |

Check it yourself:

```bash
node bin/ds.js trade "$(node -e "console.log(require('./vectors/transactions.json').vectors[0].hex)")"
```

## Royalties

Royalties are the collection record, not the sale tag. A claim inscribes one creator-signed `LAUNCH_DEPLOY` record with `royalty_bps` and `pay_to`, and every marketplace on these verbs reads that inscription. The sale tag does not carry a royalty. A marketplace fee stays with that marketplace and is not part of the standard.

## Security note

The tag adds meaning and traceability. It does not enforce the sale: the signatures and Dogecoin's transaction rules do. A marketplace still checks every signature, the outputs and the sat routing before it broadcasts.
