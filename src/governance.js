// SPDX-License-Identifier: Apache-2.0
// The governance tally, exactly as the standard states it. Integers only.
import { createHash } from 'node:crypto';

const big = (v, name) => {
  if (typeof v === 'bigint') return v;
  if (Number.isSafeInteger(v) && v >= 0) return BigInt(v);
  if (typeof v === 'string' && /^[0-9]+$/.test(v)) return BigInt(v);
  throw new TypeError(`${name} must be a non-negative integer`);
};

/**
 * Quorum holds when participating × 10000 ≥ quorum_bps × eligible_weight.
 * The proposal passes when quorum holds, yes × 10000 ≥ approval_bps × (yes + no),
 * and at least one yes or no was counted.
 * Abstain joins quorum only when the founding config says so (abstainCountsForQuorum).
 */
export function tally({ yes, no, abstain = 0, eligible_weight, quorum_bps, approval_bps, abstainCountsForQuorum = false }) {
  const Y = big(yes, 'yes'), Nn = big(no, 'no'), A = big(abstain, 'abstain');
  const E = big(eligible_weight, 'eligible_weight');
  const Q = big(quorum_bps, 'quorum_bps'), AP = big(approval_bps, 'approval_bps');
  const participating = Y + Nn + (abstainCountsForQuorum ? A : 0n);
  const quorum = participating * 10000n >= Q * E;
  const decided = Y + Nn > 0n;
  const approved = Y * 10000n >= AP * (Y + Nn);
  return { participating: participating.toString(), quorum, passed: quorum && decided && approved };
}

/** Replay order: block height, then transaction id, then inscription index. */
export function compareChainOrder(a, b) {
  if (a.height !== b.height) return a.height - b.height;
  if (a.txid !== b.txid) return a.txid < b.txid ? -1 : 1;
  return a.index - b.index;
}

/**
 * ballot_commitment: SHA-256 of the counted ballots. Each line is inscription_id, voter,
 * choice and weight separated by tabs, ending with a newline, sorted by inscription id.
 */
export function ballotCommitment(ballots) {
  const lines = [...ballots]
    .sort((a, b) => (a.inscription_id < b.inscription_id ? -1 : a.inscription_id > b.inscription_id ? 1 : 0))
    .map((b) => `${b.inscription_id}\t${b.voter}\t${b.choice}\t${b.weight}\n`)
    .join('');
  return createHash('sha256').update(lines, 'utf8').digest('hex');
}
