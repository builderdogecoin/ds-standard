# Schemas

JSON Schema (draft 2020-12), CC0.

| File | Describes |
|---|---|
| `verbs.json` | The verb registry. The reference parser loads it, so it is the one source of truth |
| `ds-tag.schema.json` | The object under `ds` |
| `ds-note.schema.json` | The JSON inside an `OP_RETURN` note |
| `ref-record.schema.json` | A signed record as the orbit serves it |
| `launch-deploy.schema.json` | A `LAUNCH_DEPLOY` collection record |

A schema checks shape. Some rules (the 80-byte limit, social and bridge ref rules, signatures) need code; the reference parser in [`src/`](../src/) checks those too.
