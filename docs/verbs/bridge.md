# 🌉 Bridge verbs

`BRIDGE_L1_DEPOSIT` `BRIDGE_L1_RELEASE` `BRIDGE_L2_INTENT`

These are `text/plain;charset=utf8` inscriptions for **Soft Bridge** only. Only Doge Soft services can create them. Soft Bridge moves DRC-20 Coins between Dogecoin L1 and the Doge Soft L2, and every bridge inscription uses this standard.

## Deposit and release

Deposit and release bodies are a plain DRC-20 transfer with `ds` = `{action, ref}` only:

```json
{"p":"drc-20","op":"transfer","tick":"DU$T","amt":"1000","ds":{"action":"BRIDGE_L1_DEPOSIT","ref":"0x…"}}
```

| Verb | Where | Ref |
|---|---|---|
| `BRIDGE_L1_DEPOSIT` | The user's DRC-20 transfer to custody | A keccak256 of the L2 domain separator, the recipient and a nonce: a fingerprint of the L2 address. The signed record is at `GET /ds/ref/<ref>`, and DogeSoftBridge 2.6.0 rebuilds the ref on chain, so the recipient cannot be changed |
| `BRIDGE_L1_RELEASE` | Custody's DRC-20 transfer back to the user | The bridge request id. Each one settles once |
| `BRIDGE_L2_INTENT` | An intent record issued by Doge Soft services | The text `Soft Bridge (Doge Soft services only)` with action and ref on the envelope |

## Why this is safe to read

The DRC-20 transfer underneath is a normal transfer, so every DRC-20 wallet reads it. Doge Soft's indexer waits for 6 confirmations and checks that the sender really held the coins, so a false inscription can't get through. Read more in the [Bridge docs](https://docs.dogesoft.io/bridge/overview/).
