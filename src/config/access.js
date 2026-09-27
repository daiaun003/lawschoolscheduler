// Passcode gate for the app. Only a SHA-256 fingerprint of the passcode lives
// here, never the passcode itself. To change the passcode:
//
//   node scripts/passcode-hash.mjs "<new passcode>"
//
// paste the printed hash below, then redeploy. Every device that unlocked with
// the old passcode is locked again until it enters the new one.
export const PASSCODE_HASH =
  '577d20870a98b5f737ebe40e74b3def8afb9f5a13824563f72b408aa30361b3b'

// Case and spaces don't matter, so "ABC 123" and "abc123" are the same code.
export const normalizePasscode = (s) => s.replace(/\s+/g, '').toLowerCase()

export async function hashPasscode(s) {
  const bytes = new TextEncoder().encode(normalizePasscode(s))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
