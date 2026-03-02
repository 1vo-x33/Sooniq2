// Run: node scripts/gen-hash.mjs
// Generates bcrypt hash for "spitfire" to use in demo data
import bcrypt from "bcryptjs"
const hash = await bcrypt.hash("spitfire", 10)
console.log(hash)
