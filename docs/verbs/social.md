# 💬 Social verbs

`TIP` `REVEAL` `BOOST`

Three verbs for social apps. Each one rides on the move itself: the payment for a post or profile. The move is the proof, so no separate proof inscription is needed. One transaction, lower fees, nothing to match up later.

```json
{"ds":{"action":"TIP","ref":"dogesoft.io/p_123"}}
```

The ref is the post: `dogesoft.io/<post id>`, or the profile id for a profile `BOOST`. `ds` holds the uppercase action and the ref. Nothing else.

| Verb | DOGE | DRC-20 |
|---|---|---|
| `TIP` tips a post's author | One payment to the author, with the tag as its `OP_RETURN` | `{"p":"drc-20","op":"transfer","tick":"DU$T","amt":"5","ds":{"action":"TIP","ref":"dogesoft.io/p_123"}}` |
| `REVEAL` pays to unlock a post: 90% to the creator, 10% to the app, in one transaction. It counts only when both outputs are there | The tag is that transaction's `OP_RETURN` | Optional: `{"p":"drc-20","op":"transfer","tick":"DU$T","amt":"50","ds":{"action":"REVEAL","ref":"dogesoft.io/p_456"}}` |
| `BOOST` promotes a post or profile | One payment, with the tag as its `OP_RETURN` | `{"p":"drc-20","op":"transfer","tick":"DU$T","amt":"10","ds":{"action":"BOOST","ref":"dogesoft.io/p_123"}}` |

## The note

Same `OP_RETURN` as the marketplace: `OP_RETURN`, then one push of the UTF-8 JSON. The push is one length byte, or `0x4c` and a length byte from 76 bytes up. At most 80 bytes and one per transaction, after the payment outputs.

A post or profile id of up to 33 characters fits all three verbs. `REVEAL` is the longest verb, and with a 33-character id the note is exactly 80 bytes:

```text
{"ds":{"action":"REVEAL","ref":"dogesoft.io/p_1111111111111111111111111111111"}}   ← 80 bytes
```

## Indexer rules

- **A real move.** The tag counts only on a real on-chain move. One transaction is one action.
- **Strict DRC-20.** A DRC-20 transfer must be valid under the strict DRC-20 rules, or the tag is ignored.
- **`TIP` and `BOOST`.** Each counts only on a real DOGE payment or a valid DRC-20 transfer that carries its tag. One transaction backs one tip or one boost.
- **Tag shape.** `action` is uppercase. Nothing else inside `ds`. `ref` must be `dogesoft.io/` with a post id, or a profile id for `BOOST`.
- **Moves only.** Posts, likes, follows and messages move nothing. They are not part of this standard and stay with the app.
