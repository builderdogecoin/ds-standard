# Changelog

All notable changes to the Doge Soft Standard. Dates are in Atlantic Time.

## v1.0.0 (2026-11-13)

- The Doge Soft Standard goes public as its own repo. 🎉
- **Tag:** `{"ds":{"action":"<VERB>","ref":"<domain>/<local>"}}`. UPPERCASE action, optional ref, nothing else inside `ds`.
- **Refs:** `dogesoft.io` is the only ref domain. `r_<n>` sale records, `lp_<slug>` collection records. Bare legacy refs still resolve.
- **Registry:** 29 verbs. Marketplace 7, Social 3, Launchpad 2, Governance 12, Security 2, Bridge 3.
- **Notes:** one `OP_RETURN` per transaction, at most 80 bytes, after the seller's payment output in a trade.
- **Signing:** seller `SIGHASH_SINGLE|ANYONECANPAY` (`0x83`), buyer `SIGHASH_ALL` (`0x01`). Records signed with Dogecoin `signmessage` over `Doge Soft` + newline + record JSON; legacy prefixes `Doge Soft ref record` and `Doge Soft collection record`.
- **Repo:** normative SPEC.md, per-area guides, JSON Schemas, test vectors (including two real mainnet trades and live signed records), a zero-dependency reference parser and `ds` command, and Such Verb Proposals.
