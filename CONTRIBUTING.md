# Contributing to the Doge Soft Standard

Much welcome, Doge Kin! A clearer sentence, a sharper vector, a parser in another language: it all makes the Orbit stronger.

## Ways to help

- **Report a disagreement.** If your parser and a vector disagree, open a bug report with the input and both results. This is the most valuable thing you can do.
- **Add a vector.** A real mainnet transaction or record that tests an edge case.
- **Improve the docs.** Clearer words for newcomers are always welcome.
- **Port the parser.** Implementations in other languages are welcome to link from the README once they pass every vector.
- **Propose a verb.** See [Such Verb Proposals](proposals/README.md).

## Before you open a pull request

1. Open an issue first for anything bigger than a small fix, so we can agree on the approach.
2. Keep each pull request to one change.
3. Run `npm test`. It needs Node.js 18 or newer and nothing else: the reference parser has zero dependencies, and we'd like to keep it that way.
4. Changing the spec? Update `SPEC.md`, the guide in `docs/`, the vectors and the schema together, and add a line to `CHANGELOG.md`.
5. Write clearly. On Doge Soft they are **DRC-20 Coins**, and amounts in records are **koinu**.
6. Never include a seed phrase, password, `.env` file, server address or anything secret.

## Sign-off and licensing

By contributing you agree your contribution is licensed under the license of the files you changed (see [LICENSING.md](LICENSING.md)) and that it is your own work. Please sign your commits.

## Be kind

Everyone here follows our [Code of Conduct](CODE_OF_CONDUCT.md). Much respect, very kindness.
