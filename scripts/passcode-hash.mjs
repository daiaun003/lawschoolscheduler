// Print the fingerprint to paste into src/config/access.js for a new passcode.
// Usage: node scripts/passcode-hash.mjs "<new passcode>"
import { hashPasscode } from '../src/config/access.js'

const passcode = process.argv[2]
if (!passcode) {
  console.error('Usage: node scripts/passcode-hash.mjs "<new passcode>"')
  process.exit(1)
}
console.log(await hashPasscode(passcode))
