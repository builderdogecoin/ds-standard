# 🐕 Such Verb Proposals (SVP)

Much idea? Very verb? Wow. This is how a new verb, ref domain or rule joins the Doge Soft Standard.

## The short version

1. **Open an issue** with the *Such Verb Proposal* template. Say what moves on chain and why no existing verb fits.
2. **Write it up.** Copy [`0000-template.md`](0000-template.md) to `proposals/XXXX-short-name.md` and open a pull request.
3. **Add vectors.** Valid and invalid cases in `vectors/`, plus the registry entry in `schema/verbs.json`. `npm test` must pass.
4. **Review.** Doge Soft maintainers review it in the open. Expect questions; that's love.
5. **Accepted.** It gets a number, a line in [CHANGELOG.md](../CHANGELOG.md) and a spec version bump.

## What makes a good verb

- **Something moves.** A verb describes a real on-chain move or an inscribed decision. Posts, likes and follows move nothing, so they stay with the app.
- **It fits the tag.** `{"ds":{"action":"NEW_VERB","ref":"…"}}`, UPPERCASE, nothing else inside `ds`, and the note still fits in 80 bytes with a realistic ref.
- **It names a record.** If the action needs detail, the detail goes in a signed record that the ref names, not in the tag.
- **It doesn't overlap.** If an existing verb already means it, use that verb.
- **It never changes the protocols underneath.** Doginals and DRC-20 rules stay exactly as they are.

## Forever rules

- A verb is never reused for a different meaning.
- A verb is never renamed. If one needs to go, it is marked retired in the registry and keeps its old meaning for old transactions.
- Every change says the spec version it applies from.

## Status words

| Status | Means |
|---|---|
| Draft | Open for comments |
| Review | Vectors in, maintainers reviewing |
| Accepted | In the registry and the spec |
| Withdrawn | The author pulled it |
| Declined | Not accepted, with the reason written down |
