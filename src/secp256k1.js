// SPDX-License-Identifier: Apache-2.0
// Just enough secp256k1 to recover a signer from a Dogecoin signmessage signature.
// Verification only: nothing here signs, and nothing here holds a secret.

export const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
export const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
const GX = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
const GY = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;
export const G = { x: GX, y: GY };

const mod = (a, m = P) => { const r = a % m; return r >= 0n ? r : r + m; };

function inv(a, m = P) {
  let [lo, hi, x0, x1] = [mod(a, m), m, 1n, 0n];
  while (lo > 1n) {
    const q = hi / lo;
    [lo, hi] = [hi - q * lo, lo];
    [x0, x1] = [x1 - q * x0, x0];
  }
  if (lo !== 1n) throw new Error('not invertible');
  return mod(x0, m);
}

function powmod(b, e, m) {
  let r = 1n; b = mod(b, m);
  while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; }
  return r;
}

// Jacobian coordinates: (X, Y, Z) means (X/Z^2, Y/Z^3). Z = 0 is the point at infinity.
const INF = { X: 0n, Y: 1n, Z: 0n };
const toJ = (p) => ({ X: p.x, Y: p.y, Z: 1n });

function dbl(p) {
  if (p.Z === 0n || p.Y === 0n) return INF;
  const Y2 = mod(p.Y * p.Y);
  const S = mod(4n * p.X * Y2);
  const M = mod(3n * p.X * p.X);
  const X = mod(M * M - 2n * S);
  return { X, Y: mod(M * (S - X) - 8n * Y2 * Y2), Z: mod(2n * p.Y * p.Z) };
}

function add(p, q) {
  if (p.Z === 0n) return q;
  if (q.Z === 0n) return p;
  const Z1 = mod(p.Z * p.Z), Z2 = mod(q.Z * q.Z);
  const U1 = mod(p.X * Z2), U2 = mod(q.X * Z1);
  const S1 = mod(p.Y * Z2 * q.Z), S2 = mod(q.Y * Z1 * p.Z);
  if (U1 === U2) return S1 === S2 ? dbl(p) : INF;
  const H = mod(U2 - U1), R = mod(S2 - S1);
  const H2 = mod(H * H), H3 = mod(H2 * H);
  const X = mod(R * R - H3 - 2n * U1 * H2);
  return { X, Y: mod(R * (U1 * H2 - X) - S1 * H3), Z: mod(H * p.Z * q.Z) };
}

function mul(p, k) {
  let r = INF, a = toJ(p);
  k = mod(k, N);
  while (k > 0n) { if (k & 1n) r = add(r, a); a = dbl(a); k >>= 1n; }
  return r;
}

function toAffine(p) {
  if (p.Z === 0n) return null;
  const zi = inv(p.Z), zi2 = mod(zi * zi);
  return { x: mod(p.X * zi2), y: mod(p.Y * zi2 * zi) };
}

export function liftX(x, odd) {
  if (x >= P) return null;
  const y2 = mod(x * x * x + 7n);
  let y = powmod(y2, (P + 1n) / 4n, P);
  if (mod(y * y) !== y2) return null;
  if ((y & 1n) !== (odd ? 1n : 0n)) y = P - y;
  return { x, y };
}

/**
 * Recover the public point Q from a message hash e and signature (r, s, recid),
 * where Q = r^-1 (sR - eG). Returns null when the signature cannot be recovered.
 */
export function recover(e, r, s, recid) {
  if (r <= 0n || r >= N || s <= 0n || s >= N) return null;
  const x = r + (recid >> 1 ? N : 0n);
  const R = liftX(x, recid & 1);
  if (!R) return null;
  const ri = inv(r, N);
  const sR = mul(R, mod(s * ri, N));
  const eG = mul(G, mod(-e * ri, N));
  return toAffine(add(sR, eG));
}

export function serializePoint(q, compressed) {
  const hx = q.x.toString(16).padStart(64, '0');
  if (compressed) return (q.y & 1n ? '03' : '02') + hx;
  return '04' + hx + q.y.toString(16).padStart(64, '0');
}
