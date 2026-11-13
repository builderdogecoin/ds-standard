# 🏛️ Governance verbs

`GOV_CREATE` `GOV_UPDATE` `GOV_PROPOSE` `GOV_VOTE` `GOV_FINALIZE` `GOV_EXECUTE` `GOV_CANCEL` `GOV_DELEGATE` `GOV_APPOINT` `GOV_REMOVE` `GOV_RESIGN` `GOV_TRANSFER_AUTHORITY`

**The inscription is the decision.** A collection, a trait or a council can inscribe its own organization. The indexer rebuilds it from Dogecoin Core, and that rebuild is the source of truth. The organization picks the electorate in `GOV_CREATE`, and the governance id is that inscription's id.

## The body

`application/json`. `ds` is still only `action` and an optional `ref`; the rules sit beside it. The orbit checks the body and returns the `application/json` and its SHA-256, and you inscribe that JSON with your own wallet. A `ref` on it names the same `signmessage` record as every other verb.

## Electorates

| Electorate | Tally |
|---|---|
| `wallet_allowlist` with `one_wallet` | The council the indexer tallies |
| `doginal_holder`, `doginal_trait` | Valid founding configs for a collection or a trait. Ballots are stored and are not counted |
| `open` | Not counted |

`asset_units` names a `unit_ledger_ref`. This category does not mint that ledger. A 100×100 grid is 10,000 units in that ledger, not 1,000 members, and not a governance verb.

## The tally

```text
quorum  holds when  participating × 10000 ≥ quorum_bps × eligible_weight
passes  when        quorum  and  yes × 10000 ≥ approval_bps × (yes + no)  and  yes + no ≥ 1
```

- Abstain joins quorum only when the founding config says so.
- Set `approval_bps` to 5001 for a strict majority of yes against no.
- The indexer recomputes this. A finalize inscription that disagrees is rejected.

Try it: `tally()` in [`src/governance.js`](../../src/governance.js), with edge cases in [`vectors/governance-tally.json`](../../vectors/governance-tally.json).

## Ballots

- The `voter` string is not a signature. A ballot counts when that address holds the vote inscription and is on the allowlist.
- The first in-window ballot sticks.
- Order is block height, then transaction id, then inscription index. Put one governance action in a transaction if you need it to follow chain order inside a block.
- `ballot_commitment` is the SHA-256 of the counted ballots. Each line is `inscription_id`, voter, choice and weight, separated by tabs, with a newline, sorted by inscription id.

## Custody

A passed proposal authorizes a spend; it does not spend by itself. Two custodians of a 2-of-3 still sign. Replacing a signer moves the coins to a new output. `GOV_EXECUTE` records a transaction id and does not mark the effect verified. Delegation is recorded and does not change weight.

Read live organizations on the [Explorer governance API](https://docs.dogesoft.io/explorer/governance/).
