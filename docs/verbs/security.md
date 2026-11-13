# 🛡️ Security verbs

`ANCHOR` `REFUND`

Proof anchors and refunds from Doge Soft services.

| Verb | Means |
|---|---|
| `ANCHOR` | A proof anchor from a Doge Soft service |
| `REFUND` | A refund from a Doge Soft service |

Same tag shape as every other verb:

```json
{"ds":{"action":"ANCHOR","ref":"dogesoft.io/r_5"}}
```

The ref names the signed record behind it, checked like any other ([records.md](../records.md)).
