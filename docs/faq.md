# FAQ

**What is `ds` in one line?**
One tiny tag, `{"ds":{"action":"<VERB>","ref":"<id>"}}`, that tells every Dogecoin app what a transaction means.

**Does it change Doginals or DRC-20?**
No. Doge Soft follows the Doginals and DRC-20 protocol rules strictly and adds nothing to them. The tag rides beside them. Standard inscription parsers ignore the note, and every DRC-20 wallet still reads a tagged transfer as a normal transfer.

**Why an `OP_RETURN` and not a new inscription?**
No extra transaction, lower fees, nothing to match up later. The tag lives in the same transaction as the move it describes.

**Why only `action` and `ref`?**
Everything else is already in the transaction (price, seller, buyer are outputs) or in the signed record. Keeping `ds` tiny means it fits in 80 bytes and nobody has to argue about extra fields.

**Does the tag make a trade safe?**
No, and it doesn't pretend to. The signatures (`0x83` for the seller, `0x01` for the buyer) and Dogecoin's own transaction rules secure the trade. The tag adds meaning and traceability.

**Why aren't listings and offers on chain?**
They are signed records in each marketplace's own book. Putting them on chain would cost fees for things that may never happen. A tag goes on chain only when something actually moves.

**Who can use the verbs?**
Anyone can run a marketplace or social app on them. Bridge verbs are the exception: only Doge Soft services create them.

**Can I add a verb?**
Yes: write a [Such Verb Proposal](../proposals/README.md).

**Is `ref` required?**
It is optional in the tag shape. Social verbs, `BRIDGE_L1_DEPOSIT` and `BRIDGE_L1_RELEASE` need one, and a `LAUNCH_DEPLOY` record carries its collection ref. Marketplace sales carry the ref of their sale record.

**What is a bare ref?**
An older ref with no domain, like `r_2`. It still resolves on `dogesoft.io`. New tags include the domain.
