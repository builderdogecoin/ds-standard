// SPDX-License-Identifier: Apache-2.0
// The Doge Soft Standard (ds) reference parser. Zero dependencies, Node built-ins only.
export { VERSION, AREAS, VERBS, areaOf, isVerb } from './registry.js';
export { DOMAINS, DEFAULT_DOMAIN, parseRef, validateTag, validateBody, validateNoteText, makeTag } from './tag.js';
export { MAX_NOTE_BYTES, encodeNote, decodeNote } from './opreturn.js';
export { parseTx, findNote, sighashOf, inspectTrade, SIGHASH_ALL, SIGHASH_SINGLE_ANYONECANPAY } from './tx.js';
export { RECORD_PREFIX, LEGACY_PREFIXES, messageHash, recoverAddress, verifyMessage, recordMessage, verifyRecord, verifySelfSigned } from './message.js';
export { validateLaunchDeploy, verifyLaunchDeploy } from './launch.js';
export { tally, compareChainOrder, ballotCommitment } from './governance.js';
export { isDogeAddress } from './base58.js';
