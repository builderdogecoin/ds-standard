# 🚀 Launchpad verbs

`LAUNCH_DEPLOY` `LAUNCH_MINT`

## The art stays a plain Doginal

The art is a plain Doginal in the standard Doginals envelope, with 240-byte chunks. Big files span a chain of reveal transactions (multi-reveal is live), and the inscription id is the first reveal's txid + `i0`. Every Doginals wallet, market and explorer shows it normally. No tag touches the art.

## `LAUNCH_DEPLOY`: the collection record

```json
{"ds":{"action":"LAUNCH_DEPLOY","ref":"dogesoft.io/lp_<slug>"},"name":"Moon Dogs","supply":100,"royalty_bps":500,"pay_to":"D…","sig":"…"}
```

| Field | Rule |
|---|---|
| `ds` | `LAUNCH_DEPLOY` and a collection ref `dogesoft.io/lp_<slug>` |
| `royalty_bps` | A whole percent in basis points: a multiple of 100 (`500` is 5%) |
| `pay_to` | The D-address that receives the royalty |
| `sig` | The creator's `signmessage` over `Doge Soft`, a newline, then this record without `sig` |

The `ref` names the Doge Soft ref record, signed the same way as every other verb. Royalty stays on the collection record and is never copied into a marketplace tag. Every marketplace on the standard reads this one inscription.

Schema: [`schema/launch-deploy.schema.json`](../../schema/launch-deploy.schema.json). Vectors: [`vectors/launch-deploy.json`](../../vectors/launch-deploy.json).

## `LAUNCH_MINT`

`LAUNCH_MINT` is the tag on the buyer's mint transaction. Lazy mints inscribe nothing until someone buys.

```json
{"ds":{"action":"LAUNCH_MINT","ref":"dogesoft.io/lp_moon-dogs"}}
```
