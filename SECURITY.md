# Security

Keeping every Doge Kin safe comes first.

## Reporting a vulnerability

**Please don't open a public issue.** Report it confidentially through one of these:

- GitHub vulnerability reporting: the **Security** tab of this repo, then **Report a vulnerability**.
- Email: koinu@dogesoft.io

Include what you found, how to reproduce it, and what it affects. We aim to reply within 72 hours and will keep you updated until it's fixed. With your permission we'll thank you by name once it's resolved.

## In scope

- The reference parser and the `ds` command in this repo
- A rule in the spec or a vector that would let a tag be read wrongly (for example, a tag that two conforming parsers read differently)
- Signed record verification that accepts a record it should refuse

## Remember

A `ds` tag adds meaning; it never moves coins and never replaces a signature check. Before you trust a trade, check the signatures and the outputs. Before you trust a record, verify its `signmessage`.

Doge Soft will never ask for your seed phrase or password, in an issue, a DM or anywhere else. Anyone asking is not us.
