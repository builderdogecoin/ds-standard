# Test vectors

Plain JSON, CC0. Every implementation of the Doge Soft Standard should give these results. `npm test` runs all of them against the reference parser.

| File | Cases |
|---|---|
| `tags.json` | Notes and inscription bodies, valid and invalid, with the expected error codes |
| `op-return.json` | Note scripts to decode (75, 76, 79, 80 and 81 bytes, push forms, UTF-8) and tags to encode |
| `transactions.json` | Real mainnet trades with the note, its output index and each input's sighash |
| `records.json` | Live signed records from the orbit, plus tampered copies that must fail |
| `launch-deploy.json` | `LAUNCH_DEPLOY` record shapes (signatures here are placeholders) |
| `governance-tally.json` | Quorum and approval edge cases |

Error codes are listed in [SPEC.md section 15](../SPEC.md#15-error-codes-informative).
