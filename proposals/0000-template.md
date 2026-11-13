# SVP-XXXX: <Verb or change name>

| | |
|---|---|
| **Status** | Draft |
| **Author** | <name, contact> |
| **Area** | Marketplace / Social / Launchpad / Governance / Security / Bridge / New area |
| **Verbs** | `NEW_VERB` |
| **Spec version** | <version this applies from> |

## Summary

One or two sentences: what this verb says a transaction *is*.

## What moves on chain

Which transaction carries the tag, which outputs carry the value, and who signs with which sighash.

## The tag

```json
{"ds":{"action":"NEW_VERB","ref":"dogesoft.io/<local>"}}
```

Byte length with the longest realistic ref: __ bytes (must be at most 80 for an `OP_RETURN` note).

## The record

What the signed record behind the ref contains, and who signs it.

## Indexer rules

When does the tag count? When is it ignored?

## Why not an existing verb?

## Vectors

List the vectors this proposal adds to `vectors/`.

## Security considerations

What could go wrong, and why the signatures, not the tag, protect the user.
