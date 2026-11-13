# The Doge Soft Standard (`ds`), v1.0.0

**Status:** Live. **Editor:** Doge Soft. **License:** CC-BY-4.0.

The Doge Soft Standard says what a Dogecoin transaction **is**: a sale, a launch, a bridge deposit, a governance action. Marketplace tags go on chain when assets move. A governance action is the inscription itself. Listings, offers, bids and cancels stay signed records.

The words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT** and **MAY** are to be read as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals.

## 1. Scope

1.1. `ds` is a Doge Soft standard. It is an application layer that rides beside the Doginals and DRC-20 protocols. Doge Soft follows the Doginals and DRC-20 protocol rules strictly and adds nothing to them. A `ds` tag MUST NOT change the meaning of any Doginals or DRC-20 operation.

1.2. The source of truth is Dogecoin Core. The Doge Soft Rust indexer reads the full chain from Dogecoin Core, and that index is the source of truth for the Doge Soft Orbit. Any indexer that implements this spec SHOULD rebuild the same answers from the same chain.

1.3. Not part of this standard:

- Dogecoin Names keeps its own signed format (`"p":"dns"` with a registrar `sig`).
- DRC-20 deploy, mint and transfer are their own protocol. They stay positional.
- Posts, likes, follows and messages move nothing. They stay with the app.

## 2. The tag

2.1. A tag is a JSON object under the name `ds`:

```json
{"ds":{"action":"<VERB>","ref":"<Doge Soft-issued id>"}}
```

2.2. `ds` MUST be a JSON object.

2.3. `ds` MUST contain `action`, a string that is an UPPERCASE verb from the registry in section 5. A parser MUST reject an action that is not uppercase (for example `buy` or `Buy`) and MUST reject a verb that is not in the registry.

2.4. `ds` MAY contain `ref`, a string naming the record (section 3). Some verbs require it (sections 6 to 11).

2.5. `ds` MUST NOT contain anything other than `action` and `ref`. A parser MUST reject a tag with any other field inside `ds`. Price, seller, buyer and royalty never go inside `ds`.

2.6. Writers SHOULD emit `action` first and `ref` second, with no whitespace, as in `{"ds":{"action":"BUY","ref":"dogesoft.io/r_1"}}`.

## 3. Refs

3.1. A ref is `<domain>/<local>`.

3.2. The only ref domain is `dogesoft.io`. A parser MUST reject a ref with any other domain. New ref domains join through a proposal (section 13).

3.3. Locals keep their kinds:

| Local | Kind |
|---|---|
| `r_<n>` | A sale record. `<n>` is a decimal number. |
| `lp_<slug>` | A collection record. `<slug>` is not empty. |

A local that starts with `r_` MUST be `r_` followed by digits only. A local that starts with `lp_` MUST have a non-empty slug.

3.4. Both the domain and the local MUST be non-empty. A ref MUST NOT be empty and MUST NOT contain whitespace or control characters.

3.5. Bare legacy refs without a domain (for example `r_2`) still resolve, on the default domain `dogesoft.io`. Parsers MUST accept them. New writers SHOULD include the domain.

## 4. Where a tag rides

### 4.1. The `OP_RETURN` note

4.1.1. For trades and DOGE payments, the tag is an `OP_RETURN` note inside the transaction itself. There is no extra transaction.

4.1.2. The output script MUST be `OP_RETURN` (`0x6a`) followed by exactly one push of the UTF-8 JSON of the note, and nothing after it.

4.1.3. The push MUST be one length byte for data of 1 to 75 bytes, or `0x4c` (`OP_PUSHDATA1`) and a length byte from 76 bytes up. Other push forms MUST be rejected.

4.1.4. The note data MUST be at most **80 bytes**.

4.1.5. A transaction MUST carry at most **one** `OP_RETURN` output. A transaction with more than one carries no valid note.

4.1.6. The note text MUST be exactly the tag object `{"ds":{...}}`, with nothing beside `ds`.

4.1.7. The note SHOULD be a 0-value output. It goes after the payment outputs. In a marketplace trade it MUST come after the seller's payment output (section 6.3).

4.1.8. Standard inscription parsers ignore the note. It does not move a Doginal and does not change the seller's signed output.

### 4.2. Inside an inscription body

4.2.1. A JSON inscription body MAY carry `ds` beside its own fields, for example a DRC-20 transfer:

```json
{"p":"drc-20","op":"transfer","tick":"DU$T","amt":"1000","ds":{"action":"BUY","ref":"dogesoft.io/r_1"}}
```

4.2.2. `ds` inside a body follows section 2 exactly: only `action` and an optional `ref`. The protocol's own fields stay where that protocol puts them.

4.2.3. A DRC-20 transfer carrying a tag MUST be valid under the strict DRC-20 rules, or the tag is ignored.

### 4.3. Sizes

- Each push is at most 520 bytes (Dogecoin's limit).
- Doginals content uses 240-byte chunks, at most 1,500 bytes of pushes per reveal, and each reveal's `scriptSig` stays under 1,650 bytes.
- An `OP_RETURN` note is at most 80 bytes, and only one is allowed per transaction.

## 5. Verb registry

| Area | Verbs |
|---|---|
| Marketplace | `BUY` `AUCTION_SOLD` `OFFER_ACCEPT` `GIFT` `BUNDLE` `PARTIAL_FILL` `COLLECTION_TRANSFER` |
| Social | `TIP` `REVEAL` `BOOST` |
| Launchpad | `LAUNCH_DEPLOY` `LAUNCH_MINT` |
| Governance | `GOV_CREATE` `GOV_UPDATE` `GOV_PROPOSE` `GOV_VOTE` `GOV_FINALIZE` `GOV_EXECUTE` `GOV_CANCEL` `GOV_DELEGATE` `GOV_APPOINT` `GOV_REMOVE` `GOV_RESIGN` `GOV_TRANSFER_AUTHORITY` |
| Security | `ANCHOR` `REFUND` |
| Bridge | `BRIDGE_L1_DEPOSIT` `BRIDGE_L1_RELEASE` `BRIDGE_L2_INTENT` |

The machine-readable registry is [`schema/verbs.json`](schema/verbs.json). Verbs join through a proposal (section 13).

## 6. Marketplace

6.1. Anyone can run a marketplace on the seven marketplace verbs. The tag goes on the one transaction that spends the dog. One tag covers both sides. Price, seller and buyer are the outputs of that transaction.

6.2. Every marketplace verb has the same shape: `{"ds":{"action":"BUY","ref":"dogesoft.io/r_1"}}`, with `BUY` replaced by `AUCTION_SOLD`, `OFFER_ACCEPT`, `GIFT`, `BUNDLE`, `PARTIAL_FILL` or `COLLECTION_TRANSFER`.

6.3. It is one `OP_RETURN` note of at most 80 bytes, appended after the seller's payment output.

6.4. `GIFT` has no price. `BUNDLE`, `PARTIAL_FILL` and `COLLECTION_TRANSFER` name every dog those inputs moved.

6.5. The ref is the long form of that sale. Doge Soft signs that record with the same Dogecoin `signmessage` (section 12) after the outputs check.

6.6. A listing, offer, bid or cancel is a signed record in that marketplace's own book. It is not an inscription, and it MUST NOT get a tag. Moving the dog anywhere else ends the listing.

6.7. **Who signs.** The seller MUST sign `SIGHASH_SINGLE|ANYONECANPAY` (`0x83`) on their payment output. The buyer, bidder or offer signer MUST use `SIGHASH_ALL` (`0x01`), so the tag is already in the template before they sign.

6.8. **Royalties are the collection record.** A claim inscribes one creator-signed `LAUNCH_DEPLOY` record with `royalty_bps` and `pay_to` (section 8). Every marketplace on these verbs reads that inscription. The sale tag MUST NOT carry a royalty. A marketplace fee stays with that marketplace and is not part of this standard.

6.9. *Informative.* The Doge Soft Marketplace trade layout is: input 0 the buyer's dummy coin, input 1 the seller's inscription carrier, inputs 2 and up the buyer's payment coins; output 0 the buyer (dummy plus carrier, so the Doginal lands there), output 1 the seller's signed amount, then any royalty, fee, dummy and change outputs, then the 0-value `ds` note. Because `SIGHASH_SINGLE` pairs input 1 with output 1, the seller signs at input index 1. Other marketplaces MAY use another layout as long as sections 6.3 and 6.7 hold.

## 7. Social

7.1. Three verbs for social apps. Each one rides on the move itself: the payment for a post or profile. The move is the proof, so no separate proof inscription is needed.

```json
{"ds":{"action":"TIP","ref":"dogesoft.io/p_123"}}
```

7.2. The ref is the post: `dogesoft.io/<post id>`, or the profile id for a profile `BOOST`. A social tag MUST have a ref.

7.3. `TIP` tips a post's author. DOGE: one payment to the author, with the tag as its `OP_RETURN` note. DRC-20: a transfer with `ds` in the body.

7.4. `REVEAL` pays to unlock a post. One transaction pays 90% to the creator and 10% to the app. It counts only when both outputs are there. DOGE: the tag is that transaction's `OP_RETURN` note. DRC-20 is optional.

7.5. `BOOST` promotes a post or profile. It is paid in DOGE or a DRC-20, and the ref is that post or profile id.

7.6. **Indexer rules.**

- A real move. The tag counts only on a real on-chain move. One transaction is one action.
- Strict DRC-20. A DRC-20 transfer must be valid under the strict DRC-20 rules, or the tag is ignored.
- `TIP` and `BOOST` each count only on a real DOGE payment or a valid DRC-20 transfer that carries the tag. One transaction backs one tip or one boost.
- Tag shape. `action` is uppercase. Nothing else inside `ds`. `ref` is `dogesoft.io/` with a post id, or a profile id for `BOOST`.

7.7. A post or profile id of up to 33 characters fits all three verbs within the 80-byte note.

## 8. Launchpad and art

8.1. The art is a plain Doginal in the standard Doginals envelope, with 240-byte chunks. Big files span a chain of reveal transactions (multi-reveal), and the inscription id is the first reveal's txid plus `i0`. Every Doginals wallet, market and explorer shows it normally.

8.2. `LAUNCH_DEPLOY` is a collection record:

```json
{"ds":{"action":"LAUNCH_DEPLOY","ref":"dogesoft.io/lp_<slug>"},"name":"Moon Dogs","supply":100,"royalty_bps":500,"pay_to":"D…","sig":"…"}
```

- `royalty_bps` MUST be a whole percent in basis points: an integer multiple of 100, from 0 to 10000.
- `pay_to` MUST be the D-address that receives the royalty.
- `sig` is the creator's `signmessage` over `Doge Soft`, a newline, then that record without `sig`.
- The `ref` names the Doge Soft ref record, signed the same way as every other verb.
- Royalty stays on the collection record and MUST NOT be copied into a marketplace tag.

8.3. `LAUNCH_MINT` is the tag on the buyer's mint transaction. Lazy mints inscribe nothing until someone buys.

## 9. Governance

9.1. A collection, a trait or a council can inscribe its own organization. The indexer rebuilds it from Dogecoin Core, and that rebuild is the source of truth. The organization picks the electorate in `GOV_CREATE`. The governance id is that inscription's id.

9.2. **Body.** `application/json`. `ds` is still only `action` and an optional `ref`. The rules sit beside it. A `ref` on it names the same `signmessage` record as every other verb.

9.3. **Electorates.** `wallet_allowlist` with `one_wallet` is the council the indexer tallies. `doginal_holder` and `doginal_trait` are valid founding configs for a collection or a trait; their ballots are stored and are not counted in the tally. `open` is not counted.

9.4. **Shares.** `asset_units` names a `unit_ledger_ref`. This category does not mint that ledger. A 100×100 grid is 10,000 units in that ledger, not 1,000 members, and not a governance verb.

9.5. **Tally.** Quorum holds when `participating × 10000 ≥ quorum_bps × eligible_weight`. The proposal passes when quorum holds, `yes × 10000 ≥ approval_bps × (yes + no)`, and at least one yes or no was counted. Abstain joins quorum only when the founding config says so. Set `approval_bps` to 5001 for a strict majority of yes against no. The indexer recomputes this. A finalize inscription that disagrees MUST be rejected.

9.6. **Ballots.** The `voter` string is not a signature. A ballot counts when that address holds the vote inscription and is on the allowlist. The first in-window ballot sticks. Order is block height, then transaction id, then inscription index.

9.7. **Ballot commitment.** `ballot_commitment` is the SHA-256 of the counted ballots. Each line is `inscription_id`, voter, choice and weight, separated by tabs, with a newline. Lines are sorted by inscription id.

9.8. **Custody.** A passed proposal authorizes a spend. Two custodians of a 2-of-3 still sign. Replacing a signer moves the coins to a new output. `GOV_EXECUTE` records a transaction id and does not mark the effect verified. Delegation is recorded and does not change weight.

## 10. Security

`ANCHOR` and `REFUND` are proof anchors and refunds from Doge Soft services.

## 11. Bridge

11.1. `BRIDGE_L1_DEPOSIT`, `BRIDGE_L1_RELEASE` and `BRIDGE_L2_INTENT` are `text/plain;charset=utf8` inscriptions for Soft Bridge only. Only Doge Soft services can create them.

11.2. Deposit and release bodies are a plain DRC-20 transfer with `ds` = `{action, ref}` only:

```json
{"p":"drc-20","op":"transfer","tick":"DU$T","amt":"1000","ds":{"action":"BRIDGE_L1_DEPOSIT","ref":"0x…"}}
```

11.3. For a deposit, Doge Soft issues the ref as a keccak256 of the Doge Soft L2 domain separator, the recipient and a nonce: `0x` and 64 hex digits. The signed record is at `GET /ds/ref/<ref>`, and DogeSoftBridge 2.6.0 rebuilds the ref on chain, so the recipient cannot be changed.

11.4. For a release, the ref is the bridge request id and can be settled once.

11.5. `BRIDGE_L2_INTENT` is the text `Soft Bridge (Doge Soft services only)` with action and ref on the envelope.

## 12. Signed records

12.1. A ref names a record. The record's signature is a Dogecoin `signmessage` over the text `Doge Soft`, a newline, then the JSON of the record:

```text
"Doge Soft\n" + JSON.stringify(record)
```

12.2. The orbit returns the record, the signer address and the signature at `GET /ds/ref/<ref>` (for marketplace sale records, `https://marketplace.dogesoft.io/ds/ref/<ref>`), as `{ "record": {...}, "signer": "D…", "sig": "<base64>" }`. Any Dogecoin wallet can check the signature against that signer.

12.3. The JSON is the record exactly as served. Field order matters: the same fields in another order are a different message.

12.4. Older inscribed records may still verify under the previous prefixes `Doge Soft ref record` and `Doge Soft collection record`. Verifiers SHOULD try the current prefix first, then these.

12.5. Doge Soft signs these records. A partner record uses the same `signmessage` when the orbit issues one.

## 13. Changing the standard

13.1. Verbs, ref domains and rules change only through a [Such Verb Proposal](proposals/README.md), with test vectors.

13.2. Every accepted change gets a version in [CHANGELOG.md](CHANGELOG.md). Existing verbs keep their meaning forever: a verb is never reused for something else.

## 14. Conformance

An implementation conforms when it gives the same result as every vector in [`vectors/`](vectors/). The reference parser in [`src/`](src/) passes all of them (`npm test`).

## 15. Error codes (informative)

The reference parser and the vectors use these codes:

| Code | Meaning |
|---|---|
| `not_json` | The text is not JSON |
| `body_not_object` | The JSON is not an object |
| `ds_missing` | No `ds` field |
| `ds_not_object` | `ds` is not an object |
| `ds_extra_field` | Something other than `action` and `ref` inside `ds` |
| `note_extra_field` | Something beside `ds` in an `OP_RETURN` note |
| `action_missing` | No `action`, or not a string |
| `action_not_uppercase` | `action` is not UPPERCASE |
| `action_unknown` | `action` is not in the registry |
| `ref_not_string`, `ref_empty`, `ref_format` | `ref` is not a well-formed `<domain>/<local>` |
| `ref_domain` | A domain other than `dogesoft.io` |
| `ref_local` | `r_` without digits, or `lp_` without a slug |
| `ref_required` | This verb needs a ref |
| `bridge_ref_format` | A deposit ref that is not `0x` and 64 hex digits |
| `not_op_return`, `no_push`, `push_form`, `push_not_minimal`, `push_truncated`, `trailing_bytes` | The note script is not `OP_RETURN` plus one standard push |
| `note_too_big` | More than 80 bytes of note data |
| `not_utf8` | The note data is not UTF-8 |
| `no_op_return`, `multiple_op_return` | No note, or more than one `OP_RETURN` in the transaction |
